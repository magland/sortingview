from typing import List, Union
import numpy as np
import sortingview.views as vv


def raster_plot_view(self, *, unit_ids: List[int], label: Union[str, None]=None, _subsample_max_firing_rate: Union[float, None]=None):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    if label is None:
        label = 'Raster plot'

    plots: vv.RasterPlotItem = []
    for unit_id in unit_ids:
        spike_times_sec = np.array(self.get_unit_spike_train(unit_id=unit_id)) / self.sampling_frequency
        if _subsample_max_firing_rate is not None:
            max_num = int(self.num_frames / self.sampling_frequency * _subsample_max_firing_rate)
            if len(spike_times_sec) > max_num:
                spike_times_sec = _subsample(spike_times_sec, max_num)
        plots.append(vv.RasterPlotItem(
            unit_id=unit_id,
            spike_times_sec=spike_times_sec.astype(np.float32)
        ))

    return vv.RasterPlot(
        start_time_sec=0,
        end_time_sec=self.num_frames / self.sampling_frequency,
        plots=plots
    )

def _subsample(x: np.array, num: int):
    if num >= len(x):
        return x
    incr = len(x) / num
    inds = np.floor(np.arange(num) * incr).astype(np.int32)
    return x[inds]
