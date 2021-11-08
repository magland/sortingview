from typing import Dict, Union

import h5py
import hither2 as hi
import kachery_client as kc
import numpy as np
from sortingview.extractors import LabboxEphysSortingExtractor, LabboxEphysRecordingExtractor
from sortingview.experimental.SpikeSortingView.prepare_spikesortingview_data import prepare_spikesortingview_data
from sortingview.experimental.SpikeSortingView.SpikeSortingView import SpikeSortingView
from sortingview.extractors.subrecording import subrecording
from sortingview.extractors.subsorting import subsorting

@hi.function(
    'prepare_snippets_h5', '0.3.0'
)
def prepare_snippets_h5(
    recording_object,
    sorting_object,
    start_frame=None,
    end_frame=None,
    snippet_len=(50, 80),

    # the following are ignored
    max_events_per_unit=None,
    max_neighborhood_size=15
):
    recording = LabboxEphysRecordingExtractor(recording_object)
    sorting = LabboxEphysSortingExtractor(sorting_object)

    if start_frame is not None:
        recording = subrecording(recording=recording, start_frame=start_frame, end_frame=end_frame)
        sorting = subsorting(sorting=sorting, start_frame=start_frame, end_frame=end_frame)

    data_uri = prepare_spikesortingview_data(
        recording=recording,
        sorting=sorting,
        segment_duration_sec=60 * 30,
        snippet_len=snippet_len,
        max_num_snippets_per_segment=100,
        channel_neighborhood_size=7
    )
    X = SpikeSortingView(data_uri)
    with kc.TemporaryDirectory() as tmpdir:
        save_path = tmpdir + '/snippets.h5'
        
        unit_ids = X.unit_ids
        samplerate = X.sampling_frequency

        channel_ids_by_unit = {}
        for unit_id in unit_ids:
            channel_ids = X.get_unit_channel_neighborhood(unit_id=unit_id)
            channel_ids_by_unit[int(unit_id)] = channel_ids

        with h5py.File(save_path, 'w') as f:
            f.create_dataset('unit_ids', data=np.array(unit_ids).astype(np.int32))
            f.create_dataset('sampling_frequency', data=np.array([samplerate]).astype(np.float64))
            f.create_dataset('channel_ids', data=np.array(recording.get_channel_ids()))
            f.create_dataset('num_frames', data=np.array([recording.get_num_frames()]).astype(np.int32))
            channel_locations = recording.get_channel_locations()
            f.create_dataset(f'channel_locations', data=np.array(channel_locations))
            for ii, unit_id in enumerate(unit_ids):
                print(f'Unit {ii} of {len(unit_ids)}')
                x = sorting.get_unit_spike_train(unit_id=unit_id)
                f.create_dataset(f'unit_spike_trains/{unit_id}', data=np.array(x).astype(np.float64))
                y = X.get_unit_spike_amplitudes(unit_id=unit_id)
                f.create_dataset(f'unit_spike_amplitudes/{unit_id}', data=np.array(y).astype(np.float32))
                unit_waveforms = X.get_unit_subsampled_spike_snippets(unit_id=unit_id)
                unit_waveforms = np.transpose(unit_waveforms, [0, 2, 1])
                st = X.get_unit_subsampled_spike_train(unit_id=unit_id)
                f.create_dataset(f'unit_waveforms/{unit_id}/waveforms', data=unit_waveforms)
                f.create_dataset(f'unit_waveforms/{unit_id}/channel_ids', data=np.array(channel_ids_by_unit[int(unit_id)]).astype(int))
                f.create_dataset(f'unit_waveforms/{unit_id}/spike_train', data=st.astype(np.float64))

        return kc.store_file(save_path)