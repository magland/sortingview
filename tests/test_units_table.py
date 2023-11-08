# 7/1/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://b10f9ff556dbf5ba7d029c9d56a266f0488e58d6&label=test_units_table

from typing import List
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)
    assert isinstance(recording, si.BaseRecording)

    view = test_units_table(recording=recording, sorting=sorting)

    url = view.url(label="test_units_table")
    print(url)


def test_units_table(*, recording: si.BaseRecording, sorting: si.BaseSorting):
    columns: List[vv.UnitsTableColumn] = [
        vv.UnitsTableColumn(key="unitId", label="Unit", dtype="int"),
        vv.UnitsTableColumn(key="numEvents", label="Num. events", dtype="int"),
        vv.UnitsTableColumn(key="firingRateHz", label="Firing rate (Hz)", dtype="float"),
    ]
    rows: List[vv.UnitsTableRow] = []
    for unit_id in sorting.get_unit_ids():
        spike_train = sorting.get_unit_spike_train(unit_id=unit_id)
        rows.append(
            vv.UnitsTableRow(
                unit_id=unit_id,
                values={"unitId": unit_id, "numEvents": len(spike_train), "firingRateHz": len(spike_train) / (recording.get_num_frames() / recording.get_sampling_frequency())},
            )
        )
    view = vv.UnitsTable(columns=columns, rows=rows)
    return view


if __name__ == "__main__":
    main()
