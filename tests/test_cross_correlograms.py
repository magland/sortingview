# 7/1/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://65f439ba799e19d6665f6508076b5a2292ecd9cd&label=test_cross_correlograms

from typing import List
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se
from helpers.compute_correlogram_data import compute_correlogram_data


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)
    assert isinstance(recording, si.BaseRecording)

    view = test_cross_correlograms(recording=recording, sorting=sorting)
    url = view.url(label="test_cross_correlograms")
    print(url)


def test_cross_correlograms(*, recording: si.BaseRecording, sorting: si.BaseSorting, hide_unit_selector: bool = False):
    cross_correlogram_items: List[vv.CrossCorrelogramItem] = []
    for unit_id1 in sorting.get_unit_ids():
        for unit_id2 in sorting.get_unit_ids():
            if unit_id1 != unit_id2 + 1:
                a = compute_correlogram_data(sorting=sorting, unit_id1=unit_id1, unit_id2=unit_id2, window_size_msec=50, bin_size_msec=1)
                bin_edges_sec = a["bin_edges_sec"]
                bin_counts = a["bin_counts"]
                cross_correlogram_items.append(vv.CrossCorrelogramItem(unit_id1=unit_id1, unit_id2=unit_id2, bin_edges_sec=bin_edges_sec, bin_counts=bin_counts))

    view = vv.CrossCorrelograms(cross_correlograms=cross_correlogram_items, hide_unit_selector=hide_unit_selector)
    return view


if __name__ == "__main__":
    main()
