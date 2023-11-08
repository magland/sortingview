# 7/22/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://fe4abdcac44fda0539ca09fd1005272f124c6ee2&label=test_sorting_selection

from typing import List
import sortingview.views as vv
import spikeinterface.extractors as se
import spikeinterface as si
from test_sorting_curation_2 import test_sorting_curation_2
from test_autocorrelograms import test_autocorrelograms


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)
    assert isinstance(recording, si.BaseRecording)

    view = test_sorting_selection()
    view_sorting_curation = test_sorting_curation_2()
    view_autocorrelograms = test_autocorrelograms(sorting=sorting)

    view_markdown = vv.Markdown(
        """
# Instructions

The selection control allows you to select subsets of units based on curation labels
and control which units are globally visible.

* Select some units and mark as accepted using the curation control
* Selected other units and mark as rejected
* Mark some of the rejected units as noise
* Use the selection control to control which units are selected based on the labels
* Use the restriction buttons to control which units are globally visible
    """
    )

    view2 = vv.Box(
        direction="horizontal",
        items=[
            vv.LayoutItem(_create_units_table(sorting=sorting), max_size=250),
            vv.LayoutItem(
                vv.Splitter(
                    direction="horizontal",
                    item1=vv.LayoutItem(vv.Box(direction="vertical", items=[vv.LayoutItem(view_sorting_curation), vv.LayoutItem(view)])),
                    item2=vv.LayoutItem(vv.Box(direction="vertical", items=[vv.LayoutItem(view_markdown), vv.LayoutItem(view_autocorrelograms)])),
                )
            ),
        ],
    )

    url = view2.url(label="test_sorting_selection")
    print(url)


def test_sorting_selection():
    view = vv.SortingSelection()
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
