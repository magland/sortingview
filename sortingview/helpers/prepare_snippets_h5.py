from typing import Dict, Union

import os
import hither2 as hi
import kachery_client as kc
import numpy as np
import spikeextractors as se
from sortingview.extractors import LabboxEphysSortingExtractor, LabboxEphysRecordingExtractor
from .SubsampledSortingExtractor import SubsampledSortingExtractor
from .find_unit_peak_channels import find_unit_peak_channels
from .find_unit_neighborhoods import find_unit_neighborhoods
from .get_unit_waveforms import get_unit_waveforms

@hi.function(
    'prepare_snippets_h5', '0.2.7',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['sortingview']
)
def prepare_snippets_h5(
    recording_object,
    sorting_object,
    start_frame=None,
    end_frame=None,
    max_events_per_unit=None,
    max_neighborhood_size=15,
    snippet_len=(50, 80)
):
    if recording_object['recording_format'] == 'snippets1':
        return recording_object['data']['snippets_h5_uri']

    recording = LabboxEphysRecordingExtractor(recording_object)
    sorting = LabboxEphysSortingExtractor(sorting_object)

    with kc.TemporaryDirectory() as tmpdir:
        save_path = tmpdir + '/snippets.h5'
        prepare_snippets_h5_from_extractors(
            recording=recording,
            sorting=sorting,
            output_h5_path=save_path,
            start_frame=start_frame,
            end_frame=end_frame,
            max_events_per_unit=max_events_per_unit,
            max_neighborhood_size=max_neighborhood_size,
            snippet_len=snippet_len
        )
        return kc.store_file(save_path)

def prepare_snippets_h5_from_extractors(
    recording: se.RecordingExtractor,
    sorting: se.SortingExtractor,
    output_h5_path: str,
    start_frame,
    end_frame,
    max_neighborhood_size: int,
    max_events_per_unit: Union[None, int]=None,
    snippet_len=(50, 80)
):
    import h5py
    if start_frame is not None:
        recording = se.SubRecordingExtractor(parent_recording=recording, start_frame=start_frame, end_frame=end_frame)
        sorting = se.SubSortingExtractor(parent_sorting=sorting, start_frame=start_frame, end_frame=end_frame)

    unit_ids = sorting.get_unit_ids()
    samplerate = recording.get_sampling_frequency()
    
    # Use this optimized function rather than spiketoolkit's version
    # for efficiency with long recordings and/or many channels, units or spikes
    # we should submit this to the spiketoolkit project as a PR
    print('Subsampling sorting')
    if max_events_per_unit is not None:
        sorting_subsampled = SubsampledSortingExtractor(parent_sorting=sorting, max_events_per_unit=max_events_per_unit, method='random')
    else:
        sorting_subsampled = sorting
    print('Finding unit peak channels')
    peak_channels_by_unit = find_unit_peak_channels(recording=recording, sorting=sorting, unit_ids=unit_ids)
    print('Finding unit neighborhoods')
    channel_ids_by_unit = find_unit_neighborhoods(recording=recording, peak_channels_by_unit=peak_channels_by_unit, max_neighborhood_size=max_neighborhood_size)
    print(f'Getting unit waveforms for {len(unit_ids)} units')
    unit_waveforms = get_unit_waveforms(
        recording=recording,
        sorting=sorting_subsampled,
        unit_ids=unit_ids,
        channel_ids_by_unit=channel_ids_by_unit,
        snippet_len=snippet_len
    )
    # unit_waveforms = st.postprocessing.get_unit_waveforms(
    #     recording=recording,
    #     sorting=sorting,
    #     unit_ids=unit_ids,
    #     ms_before=1,
    #     ms_after=1.5,
    #     max_spikes_per_unit=500
    # )

    save_path = output_h5_path
    with h5py.File(save_path, 'w') as f:
        f.create_dataset('unit_ids', data=np.array(unit_ids).astype(np.int32))
        f.create_dataset('sampling_frequency', data=np.array([samplerate]).astype(np.float64))
        f.create_dataset('channel_ids', data=np.array(recording.get_channel_ids()))
        f.create_dataset('num_frames', data=np.array([recording.get_num_frames()]).astype(np.int32))
        channel_locations = recording.get_channel_locations()
        f.create_dataset(f'channel_locations', data=np.array(channel_locations))
        for ii, unit_id in enumerate(unit_ids):
            x = sorting.get_unit_spike_train(unit_id=unit_id)
            f.create_dataset(f'unit_spike_trains/{unit_id}', data=np.array(x).astype(np.float64))
            f.create_dataset(f'unit_waveforms/{unit_id}/waveforms', data=unit_waveforms[ii].astype(np.float32))
            f.create_dataset(f'unit_waveforms/{unit_id}/channel_ids', data=np.array(channel_ids_by_unit[int(unit_id)]).astype(int))
            f.create_dataset(f'unit_waveforms/{unit_id}/spike_train', data=np.array(sorting_subsampled.get_unit_spike_train(unit_id=unit_id)).astype(np.float64))
