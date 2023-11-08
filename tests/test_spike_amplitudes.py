# 7/7/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://c9ae9a07468d6f55cf5b6713bb068554247e749d&label=test_spike_amplitudes

import numpy as np
from typing import List
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)
    assert isinstance(recording, si.BaseRecording)

    view = test_spike_amplitudes(recording=recording, sorting=sorting)

    url = view.url(label="test_spike_amplitudes")
    print(url)


def test_spike_amplitudes(*, recording: si.BaseRecording, sorting: si.BaseSorting, hide_unit_selector: bool = False):
    rng = np.random.default_rng(2022)
    plot_items: List[vv.SpikeAmplitudesItem] = []
    for unit_id in sorting.get_unit_ids():
        spike_times_sec = np.array(sorting.get_unit_spike_train(unit_id=unit_id)) / sorting.get_sampling_frequency()
        plot_items.append(
            vv.SpikeAmplitudesItem(
                unit_id=unit_id, spike_times_sec=spike_times_sec.astype(np.float32), spike_amplitudes=rng.normal(0, 1, spike_times_sec.shape).astype(np.float32)  # fake amplitudes
            )
        )

    view = vv.SpikeAmplitudes(start_time_sec=0, end_time_sec=recording.get_total_duration(), plots=plot_items, hide_unit_selector=hide_unit_selector)
    return view


if __name__ == "__main__":
    main()
