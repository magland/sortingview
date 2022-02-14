import os
import numpy as np
import kachery_client as kc
import sortingview as sv
from sortingview.SpikeSortingView import create_raw_traces_plot

def main():
    R, S = _load_recording_sorting()

    label = 'example raw traces'

    traces = R.get_traces(start_frame=0, end_frame=1000).T.astype(np.float32)
    F = create_raw_traces_plot(start_time_sec=0, sampling_frequency=R.get_sampling_frequency(), traces=traces, label=label)
    url = F.url()
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

if __name__ == '__main__':
    main()