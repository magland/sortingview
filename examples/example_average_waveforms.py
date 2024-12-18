# 11/8/23
# https://figurl.org/f?v=gs://figurl/spikesortingview-11dev&d=sha1://675d1a91d833f4ba26019be5c48aa91f1f35c903&label=Average%20waveforms%20example

# 8/31/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://ad6178659260bf36733a8038acbc82d2020fa4ae&label=Average%20waveforms%20example

from typing import List, Tuple
import numpy as np
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se
import kachery as ka


def main():
    ka.use_sandbox()
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0, num_segments=1, average_peak_amplitude=-20)
    assert isinstance(recording, si.BaseRecording)

    view = example_average_waveforms(recording=recording, sorting=sorting)

    url = view.url(label="Average waveforms example")
    print(url)


def example_average_waveforms(*, recording: si.BaseRecording, sorting: si.BaseSorting, height=500):
    # noise_level = estimate_noise_level(recording)
    average_waveform_items: List[vv.AverageWaveformItem] = []
    for unit_id in sorting.get_unit_ids():
        a = compute_average_waveform(recording=recording, sorting=sorting, unit_id=unit_id)
        channel_ids = a["channel_ids"]
        waveform = a["waveform"]
        average_waveform_items.append(
            vv.AverageWaveformItem(
                unit_id=unit_id,
                waveform=waveform,
                channel_ids=channel_ids,
                # waveform_std_dev=a['waveform_std_dev'],
                waveform_percentiles=a["waveform_percentiles"],
            )
        )
    channel_locations = {}
    for ii, channel_id in enumerate(recording.channel_ids):
        channel_locations[str(channel_id)] = recording.get_channel_locations()[ii, :].astype(np.float32)
    view = vv.AverageWaveforms(average_waveforms=average_waveform_items, channel_locations=channel_locations, show_reference_probe=True, height=height)
    return view


def extract_snippets(*, traces: np.ndarray, times: np.ndarray, snippet_len: Tuple[int, int]):
    N = traces.shape[0]
    M = traces.shape[1]
    T = snippet_len[0] + snippet_len[1]
    ret = np.zeros((len(times), T, M), dtype=traces.dtype)
    if len(times) == 0:
        return ret
    for t in range(T):
        times2 = times + t - snippet_len[0]
        valid = np.where((0 <= times2) & (times2 < N))
        if len(valid) > 0:
            ret[valid, t, :] = traces[times2[valid], :]
    return ret


def compute_average_waveform(*, recording: si.BaseRecording, sorting: si.BaseSorting, unit_id: int):
    if hasattr(recording, "has_scaleable_traces") and callable(getattr(recording, "has_scaleable_traces")):
        scalable = recording.has_scaleable_traces()
    elif hasattr(recording, "has_scaled") and callable(getattr(recording, "has_scaled")):
        scalable = recording.has_scaled()
    else:
        scalable = False
    traces = recording.get_traces(segment_index=0, return_scaled=scalable)
    times = sorting.get_unit_spike_train(segment_index=0, unit_id=unit_id)
    snippets = extract_snippets(traces=traces, times=times, snippet_len=(20, 20))
    waveform = np.mean(snippets, axis=0).T.astype(np.float32)
    stdev = np.std(snippets, axis=0).T.astype(np.float32)
    waveform_percentiles = np.percentile(snippets, [5, 25, 75, 95], axis=0)  # type: ignore
    waveform_percentiles = [waveform_percentiles[i].T.astype(np.float32) for i in range(4)]
    return {"channel_ids": recording.get_channel_ids().astype(np.int32), "waveform": waveform, "waveform_std_dev": stdev, "waveform_percentiles": waveform_percentiles}


if __name__ == "__main__":
    main()
