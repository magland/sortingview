from typing import List, Union
import numpy as np
import sortingview.views as vv


def spike_amplitudes_view(self, *, unit_ids: List[int], hide_unit_selector: bool=False, _subsample_max_firing_rate: Union[float, None]=None):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    plots: List[vv.SpikeAmplitudesItem] = []
    for unit_id in unit_ids:
        spike_times_sec = np.array(self.get_unit_spike_train(unit_id=unit_id)) / self.sampling_frequency
        spike_amplitudes = self.get_unit_spike_amplitudes(unit_id=unit_id)
        if _subsample_max_firing_rate is not None:
            max_num = int(self.num_frames / self.sampling_frequency * _subsample_max_firing_rate)
            if len(spike_times_sec) > max_num:
                spike_times_sec, spike_amplitudes = _subsample2(spike_times_sec, spike_amplitudes, max_num)
        plots.append(vv.SpikeAmplitudesItem(
            unit_id=unit_id,
            spike_times_sec=spike_times_sec.astype(np.float32),
            spike_amplitudes=spike_amplitudes.astype(np.float32)
        ))

    # traces_sample = self.get_traces_sample(segment=0)

    return vv.SpikeAmplitudes(
        start_time_sec=0,
        end_time_sec=self.num_frames / self.sampling_frequency,
        plots=plots,
        hide_unit_selector=hide_unit_selector
    )

def _subsample2(x: np.array, y: np.array, num: int):
    if num >= len(x):
        return x, y
    incr = len(x) / num
    inds = np.floor(np.arange(num) * incr).astype(np.int32)
    return x[inds], y[inds]
