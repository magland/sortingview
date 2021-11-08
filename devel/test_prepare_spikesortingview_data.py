import os
import numpy as np
import kachery_client as kc
import sortingview as sv
from sortingview.experimental.SpikeSortingView.prepare_spikesortingview_data import prepare_spikesortingview_data
from sortingview.experimental.SpikeSortingView.SpikeSortingView import SpikeSortingView

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
    X = SpikeSortingView(data_uri)
    assert len(X.unit_ids) == len(S.get_unit_ids())
    assert len(X.channel_ids) == len(R.get_channel_ids())
    for unit_id in X.unit_ids:
        print(unit_id)
        ts = X.get_unit_spike_train(unit_id=unit_id)
        assert(len(ts) == len(S.get_unit_spike_train(unit_id)))
        sn = X.get_unit_subsampled_spike_snippets(unit_id=unit_id)
        print(sn.shape)
        
        

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

if __name__ == '__main__':
    main()