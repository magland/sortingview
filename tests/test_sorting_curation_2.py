# 7/21/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://fda66af1aa507b7d16e171b5bf7025cd5754f38f&label=test_sorting_curation_2

from typing import List
import sortingview.views as vv
import spikeinterface.extractors as se
import spikeinterface as si


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)
    assert isinstance(recording, si.BaseRecording)

    view = test_sorting_curation_2()

    view2 = vv.Box(direction="horizontal", items=[vv.LayoutItem(_create_units_table(sorting=sorting), max_size=250), vv.LayoutItem(view)])

    url = view2.url(label="test_sorting_curation_2")
    print(url)


def test_sorting_curation_2():
    view = vv.SortingCuration2()
    return view


def _create_units_table(*, sorting: si.BaseSorting):
    columns: List[vv.UnitsTableColumn] = []
    rows: List[vv.UnitsTableRow] = []
    for unit_id in sorting.get_unit_ids():
        rows.append(vv.UnitsTableRow(unit_id=unit_id, values={"unitId": unit_id}))
    view = vv.UnitsTable(columns=columns, rows=rows)
    return view


if __name__ == "__main__":
    main()
