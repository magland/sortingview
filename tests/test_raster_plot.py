# 7/1/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://78440afa43250a347033f011c5fa30bab211cd47&label=test_raster_plot

from typing import List
import numpy as np
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)
    assert isinstance(recording, si.BaseRecording)

    view = test_raster_plot(recording=recording, sorting=sorting)

    url = view.url(label="test_raster_plot")
    print(url)


def test_raster_plot(*, recording: si.BaseRecording, sorting: si.BaseSorting):
    plot_items: List[vv.RasterPlotItem] = []
    for unit_id in sorting.get_unit_ids():
        spike_times_sec = np.array(sorting.get_unit_spike_train(unit_id=unit_id)) / sorting.get_sampling_frequency()
        plot_items.append(vv.RasterPlotItem(unit_id=unit_id, spike_times_sec=spike_times_sec.astype(np.float32)))

    view = vv.RasterPlot(start_time_sec=0, end_time_sec=recording.get_num_frames() / recording.get_sampling_frequency(), plots=plot_items)
    return view


if __name__ == "__main__":
    main()
