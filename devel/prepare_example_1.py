# Tested with sortingview 0.6.34 on 12/9/21
# Generated:
# https://figurl.org/f?v=gs://figurl/spikesortingview-1&d=d900218c88f5921e5dc46b5ad972e802e036c7bf&channel=flatiron1&label=despereaux20191125_.nwb_02_r1_13_franklab_default_hippocampus

import os
import numpy as np
import kachery_client as kc
import sortingview as sv
from sortingview.experimental.SpikeSortingView.prepare_spikesortingview_data import prepare_spikesortingview_data
from sortingview.experimental.SpikeSortingView.SpikeSortingView import SpikeSortingView

def main():
    R, S = _load_recording_sorting()

    label = 'despereaux20191125_.nwb_02_r1_13_franklab_default_hippocampus'

    workspace = sv.create_workspace()
    rid = workspace.add_recording(recording=R, label=label)
    sid = workspace.add_sorting(recording_id=rid, sorting=S, label='sorting')
    url = workspace.experimental_spikesortingview(recording_id=rid, sorting_id=sid, label=label, include_curation=False)
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