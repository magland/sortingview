# 8/1/2022
# https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://d987b9cdba64c531d4b61e18f4e1ca82f1221055&label=test_raw_traces

import numpy as np
import sortingview as sv
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)

    R = sv.copy_recording_extractor(recording, serialize_dtype='float32')
    # S = sv.copy_sorting_extractor(sorting)

    view = test_raw_traces(recording=R)

    url = view.url(label='test_raw_traces')
    print(url)

def test_raw_traces(*, recording: si.BaseRecording):
    rng = np.random.default_rng(2022)
    # Be careful how much data you send to the cloud
    traces = recording.get_traces(start_frame=0, end_frame=int(recording.get_sampling_frequency() * 30)) # num_samples x num_channels
    recording.get_channel_ids()

    view = vv.RawTraces(
        start_time_sec=0,
        sampling_frequency=recording.get_sampling_frequency(),
        traces=traces.astype(np.float32),
        channel_ids=recording.get_channel_ids().astype(np.int32)
    )
    return view

if __name__ == '__main__':
    main()
