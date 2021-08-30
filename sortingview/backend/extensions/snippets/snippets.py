import os
import hither2 as hi
import kachery_client as kc
import numpy as np
from sortingview.serialize_wrapper import serialize_wrapper
from sortingview.helpers import get_unit_waveforms_from_snippets_h5


@hi.function(
    'get_sorting_unit_snippets', '0.1.8',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['sortingview']
)
@serialize_wrapper
def get_sorting_unit_snippets(snippets_h5, unit_id, time_range, max_num_snippets):
    import h5py
    h5_path = kc.load_file(snippets_h5)
    assert h5_path is not None
    # with h5py.File(h5_path, 'r') as f:
    #     unit_ids = np.array(f.get('unit_ids'))
    #     channel_ids = np.array(f.get('channel_ids'))
    #     channel_locations = np.array(f.get(f'channel_locations'))
    #     sampling_frequency = np.array(f.get('sampling_frequency'))[0].item()
    #     if np.isnan(sampling_frequency):
    #         print('WARNING: sampling frequency is nan. Using 30000 for now. Please correct the snippets file.')
    #         sampling_frequency = 30000
    #     unit_spike_train = np.array(f.get(f'unit_spike_trains/{unit_id}'))
    #     unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms'))
    #     unit_waveforms_channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))
    #     print(unit_waveforms_channel_ids)
    unit_waveforms, unit_waveforms_channel_ids, channel_locations0, sampling_frequency, unit_spike_train = get_unit_waveforms_from_snippets_h5(h5_path, unit_id)
    
    snippets = [
        {
            'index': j,
            'unitId': unit_id,
            'waveform': unit_waveforms[j].astype(np.float32),
            'timepoint': float(unit_spike_train[j])
        }
        for j in range(unit_waveforms.shape[0])
        if time_range['min'] <= unit_spike_train[j] and unit_spike_train[j] < time_range['max']
    ]

    return dict(
        channel_ids=unit_waveforms_channel_ids.astype(np.int32),
        channel_locations=channel_locations0.astype(np.float32),
        sampling_frequency=sampling_frequency,
        snippets=snippets[:max_num_snippets]
    )

@hi.function(
    'get_sorting_unit_info', '0.1.1',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['sortingview']
)
@serialize_wrapper
def get_sorting_unit_info(snippets_h5, unit_id):
    import h5py
    h5_path = kc.load_file(snippets_h5)
    assert h5_path is not None
    # with h5py.File(h5_path, 'r') as f:
    #     unit_ids = np.array(f.get('unit_ids'))
    #     channel_ids = np.array(f.get('channel_ids'))
    #     channel_locations = np.array(f.get(f'channel_locations'))
    #     sampling_frequency = np.array(f.get('sampling_frequency'))[0].item()
    #     if np.isnan(sampling_frequency):
    #         print('WARNING: sampling frequency is nan. Using 30000 for now. Please correct the snippets file.')
    #         sampling_frequency = 30000
    #     unit_waveforms_channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))
    #     print(unit_waveforms_channel_ids)
    unit_waveforms, unit_waveforms_channel_ids, channel_locations0, sampling_frequency, unit_spike_train = get_unit_waveforms_from_snippets_h5(h5_path, unit_id)
    
    channel_locations_2 = []
    for ch_id in unit_waveforms_channel_ids:
        ind = np.where(unit_waveforms_channel_ids == ch_id)[0]
        channel_locations_2.append(channel_locations0[ind].ravel().tolist())

    return dict(
        channel_ids=unit_waveforms_channel_ids.astype(np.int32),
        channel_locations=channel_locations_2,
        sampling_frequency=sampling_frequency
    )
