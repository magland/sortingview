# 7/12/22
# https://www.figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://d4941d198ff7d880d42c41ae08c03b16975aeb6d&label=test_unit_locations

from typing import List
import numpy as np
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)
    assert isinstance(recording, si.BaseRecording)

    view = test_unit_locations(recording=recording, sorting=sorting)

    view2 = vv.Box(direction="horizontal", items=[vv.LayoutItem(_create_units_table(sorting=sorting), max_size=150), vv.LayoutItem(view)])

    url = view2.url(label="test_unit_locations")
    print(url)


def test_unit_locations(*, recording: si.BaseRecording, sorting: si.BaseSorting):
    channel_locations = recording.get_channel_locations()
    xmin = np.min(channel_locations[:, 0])
    xmax = np.max(channel_locations[:, 0])
    if xmax <= xmin:
        xmax = xmin + 1
    ymin = np.min(channel_locations[:, 1])
    ymax = np.max(channel_locations[:, 1])
    if ymax <= ymin:
        ymax = ymin + 1
    # noise_level = estimate_noise_level(recording)
    unit_ids = sorting.get_unit_ids()
    unit_items: List[vv.UnitLocationsItem] = []
    for ii, unit_id in enumerate(unit_ids):
        unit_items.append(
            vv.UnitLocationsItem(
                unit_id=unit_id, x=float(xmin + ((ii + 0.5) / len(unit_ids)) * (xmax - xmin)), y=float(ymin + ((ii + 0.5) / len(unit_ids)) * (ymax - ymin))  # fake location
            )
        )
    channel_locations = {}
    for ii, channel_id in enumerate(recording.channel_ids):
        channel_locations[str(channel_id)] = recording.get_channel_locations()[ii, :].astype(np.float32)
    view = vv.UnitLocations(units=unit_items, channel_locations=channel_locations, disable_auto_rotate=True)
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
