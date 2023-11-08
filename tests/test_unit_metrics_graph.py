# 7/15/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-7&d=sha1://c104f2f1a1d824502e0e728ab72af5ebcecb9625&label=test_unit_metrics_graph

from typing import List
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se
from test_unit_locations import _create_units_table


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)
    assert isinstance(recording, si.BaseRecording)

    view = test_unit_metrics_graph(recording=recording, sorting=sorting)

    view2 = vv.Box(direction="horizontal", items=[vv.LayoutItem(_create_units_table(sorting=sorting), max_size=150), vv.LayoutItem(view)])

    url = view2.url(label="test_unit_metrics_graph")
    print(url)


def test_unit_metrics_graph(*, recording: si.BaseRecording, sorting: si.BaseSorting):
    metrics: List[vv.UnitMetricsGraphMetric] = [
        vv.UnitMetricsGraphMetric(key="numEvents", label="Num. events", dtype="int"),
        vv.UnitMetricsGraphMetric(key="firingRateHz", label="Firing rate (Hz)", dtype="float"),
    ]
    units: List[vv.UnitMetricsGraphUnit] = []
    for unit_id in sorting.get_unit_ids():
        spike_train = sorting.get_unit_spike_train(unit_id=unit_id)
        units.append(
            vv.UnitMetricsGraphUnit(
                unit_id=unit_id, values={"numEvents": len(spike_train), "firingRateHz": len(spike_train) / (recording.get_num_frames() / recording.get_sampling_frequency())}
            )
        )
    view = vv.UnitMetricsGraph(units=units, metrics=metrics)
    return view


if __name__ == "__main__":
    main()
