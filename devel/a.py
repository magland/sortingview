import os
import numpy as np
import kachery_cloud as kcl
import figurl2 as fig
import sortingview as sv
from sortingview.SpikeSortingView import prepare_spikesortingview_data
from sortingview.SpikeSortingView import SpikeSortingView
from sortingview.SpikeSortingView import create_position_plot

def main():
    R, S = _load_recording_sorting()

    data_uri = prepare_spikesortingview_data(
        recording=R,
        sorting=S,
        segment_duration_sec=60 * 20,
        snippet_len=(20, 20),
        max_num_snippets_per_segment=100,
        channel_neighborhood_size=7
    )
    curation_feed = kcl.create_feed()
    X = SpikeSortingView(data_uri)
    SpikeSortingView.set_sorting_curation_authorized_users(curation_feed.feed_id, ['jmagland@flatironinstitute.org'])
    test_metric_data = {}
    for u in X.unit_ids:
        test_metric_data[str(u)] = u
    unit_metrics = [
        {
            'name': 'test',
            'label': 'Test metric',
            'data': test_metric_data
        }
    ]
    f1 = X.create_summary()
    f2 = X.create_units_table(unit_ids=X.unit_ids, unit_metrics=unit_metrics)
    f3 = X.create_autocorrelograms(unit_ids=X.unit_ids)
    f4 = X.create_raster_plot(unit_ids=X.unit_ids)
    f5 = X.create_average_waveforms(unit_ids=X.unit_ids)
    f6 = X.create_spike_amplitudes(unit_ids=X.unit_ids)
    f7 = X.create_electrode_geometry()
    f8 = X.create_live_cross_correlograms()

    timestamps, positions, dimension_labels = _load_positions()
    f9 = create_position_plot(timestamps=timestamps, positions=positions, dimension_labels=dimension_labels, sampling_frequency=20, label='Position')
    timestamps, positions, dimension_labels = _load_linearized_positions()
    f10 = create_position_plot(timestamps=timestamps, positions=positions, dimension_labels=dimension_labels, sampling_frequency=20, label='Linearized position')

    mountain_layout = X.create_mountain_layout(figures=[f1, f2, f3, f4, f5, f6, f7, f8, f9, f10], label='Test MV layout', sorting_curation_uri=curation_subfeed.uri)

    url = mountain_layout.url()
    print(url)

def _load_recording_sorting():
    x = {
        "recording_object": {
            "data": {
                "h5_uri": "sha1://159bf8a5a067fe2e6fa0ddd35875c48b4b677da8/despereaux20191125_.nwb_02_r1_13_franklab_default_hippocampus_recording.h5v1?manifest=15bda63463ee3f7eb29008b989f09f4b282b427d"
            },
            "recording_format": "h5_v1"
        },
        "sorting_object": {
            "data": {
                "h5_path": "sha1://e7854e34da661693ee758df4cb9401ef90488a50/despereaux20191125_.nwb_02_r1_13_franklab_default_hippocampus_sorting.h5v1"
            },
            "sorting_format": "h5_v1"
        }
    }
    R = sv.LabboxEphysRecordingExtractor(x['recording_object'])
    S = sv.LabboxEphysSortingExtractor(x['sorting_object'])
    return R, S

def _load_positions():
    import pynwb

    fname = kcl.load_file('ipfs://bafybeig6cbafx5l7cmgn2i3c37rtzxhyl24thabu4l4xs2ab6ntblkrfqq?label=chimi20200216_new_6YC9LPAR7S.nwb')
    a = {
        'position_info_param_name': 'default_decoding',
        'nwb_file_name': 'chimi20200216_new_.nwb',
        'interval_list_name': 'pos 1 valid times',
        'analysis_file_name': 'chimi20200216_new_6YC9LPAR7S.nwb',
        'head_position_object_id': '014ecfa3-dc39-48b2-80ca-c6636c7d633a',
        'head_orientation_object_id': '402bd93e-717d-42cf-9f7c-22347381c094',
        'head_velocity_object_id': '81584f9b-ccd9-4202-aea7-9e52782b6846'
    }

    with pynwb.NWBHDF5IO(path=fname, mode='r', load_namespaces=True) as io:
        nwbf = io.read()
        head_position = nwbf.objects[a['head_position_object_id']]
        x = head_position.spatial_series['head_position']
        timestamps = x.timestamps
        timestamps = timestamps - timestamps[0]
        positions = x.data
        return timestamps[:].astype(np.float32), positions[:].astype(np.float32), ['X', 'Y']

def _load_linearized_positions():
    import pynwb

    fname = kcl.load_file('ipfs://bafybeigi5s52obmlag2hqimsog2afn7glvpsp4j4yewqqjfadxcn3oxszy?label=chimi20200216_new_P3X6058LEE.nwb')
    a = {'position_info_param_name': 'default',
    'nwb_file_name': 'chimi20200216_new_.nwb',
    'interval_list_name': 'pos 1 valid times',
    'track_graph_name': '6 arm',
    'linearization_param_name': 'default',
    'analysis_file_name': 'chimi20200216_new_P3X6058LEE.nwb',
    'linearized_position_object_id': 'ebbc3501-2d13-46f5-854b-d1ed5c543c9d'}

    with pynwb.NWBHDF5IO(path=fname, mode='r', load_namespaces=True) as io:
        nwbf = io.read()
        position = nwbf.objects[a['linearized_position_object_id']]
        timestamps = position.time
        positions = position.linear_position
        timestamps = timestamps - timestamps[0]
        return timestamps[:].astype(np.float32), positions[:].astype(np.float32), ['L']

if __name__ == '__main__':
    main()