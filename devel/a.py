import os
import numpy as np
import kachery_client as kc
import figurl as fig
import sortingview as sv
from sortingview.experimental.SpikeSortingView.prepare_spikesortingview_data import prepare_spikesortingview_data
from sortingview.experimental.SpikeSortingView.SpikeSortingView import SpikeSortingView

def main():
    R, S, recording_description, sorting_description = _load_recording_sorting()

    fname = 'a.spikesortingview.h5'
    if not os.path.exists(fname):
        prepare_spikesortingview_data(
            recording=R,
            sorting=S,
            recording_description=recording_description,
            sorting_description=sorting_description,
            output_file_name=fname,
            segment_duration_sec=60 * 20,
            snippet_len=(20, 20),
            max_num_snippets_per_segment=100,
            channel_neighborhood_size=7
        )
    X = SpikeSortingView(fname)
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
    mountain_layout = X.create_mountain_layout(figures=[f1, f2, f3, f4, f5, f6, f7], label='Test MV layout')

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
    recording_description = 'despereaux20191125_.nwb_02_r1_13_franklab_default_hippocampus_recording'
    sorting_description = 'sorting'
    return R, S, recording_description, sorting_description

if __name__ == '__main__':
    main()