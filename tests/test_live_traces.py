# 8/2/2022
#

import os
import sortingview as sv
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se
import kachery_cloud as kcl

os.environ['SORTINGVIEW_VIEW_URL'] = 'http://localhost:3001'

def main():
    kcl.use_sandbox()

    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)

    R = sv.copy_recording_extractor(recording, serialize_dtype='float32')
    # S = sv.copy_sorting_extractor(sorting)

    view = test_live_traces(recording=R)

    view.run(label='test_live_traces', port=0)

def test_live_traces(*, recording: si.BaseRecording):
    view = vv.LiveTraces(
        recording=recording,
        recording_id='test'
    )
    return view

if __name__ == '__main__':
    main()
