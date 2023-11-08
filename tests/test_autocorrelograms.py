# 7/1/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://dcc43d5806ae190bed3422539d8e2e94229e33a3&label=test_autocorrelograms

from typing import List
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se
from helpers.compute_correlogram_data import compute_correlogram_data


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)
    assert isinstance(recording, si.BaseRecording)

    view = test_autocorrelograms(sorting=sorting)
    url = view.url(label="test_autocorrelograms")
    print(url)


def test_autocorrelograms(*, sorting: si.BaseSorting):
    autocorrelogram_items: List[vv.AutocorrelogramItem] = []
    for unit_id in sorting.get_unit_ids():
        a = compute_correlogram_data(sorting=sorting, unit_id1=unit_id, unit_id2=None, window_size_msec=50, bin_size_msec=1)
        bin_edges_sec = a["bin_edges_sec"]
        bin_counts = a["bin_counts"]
        autocorrelogram_items.append(vv.AutocorrelogramItem(unit_id=unit_id, bin_edges_sec=bin_edges_sec, bin_counts=bin_counts))
    view = vv.Autocorrelograms(autocorrelograms=autocorrelogram_items)
    return view


if __name__ == "__main__":
    main()
