# 8/31/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://251bb58553c39e9ec0e4af5ff1888f023e4597d9&label=Unit%20locations%20example

from typing import List
import numpy as np
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se
import kachery_cloud as kcl
from helpers.create_units_table import create_units_table


def main():
    kcl.use_sandbox()
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0, num_segments=1)

    view = example_unit_locations(recording=recording, sorting=sorting)

    view2 = vv.Box(
        direction='horizontal',
        items=[
            vv.LayoutItem(create_units_table(sorting=sorting), max_size=150),
            vv.LayoutItem(view)
        ]
    )

    url = view2.url(label='Unit locations example')
    print(url)

def example_unit_locations(*, recording: si.BaseRecording, sorting: si.BaseSorting, height=400):
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
        unit_items.append(vv.UnitLocationsItem(
            unit_id=unit_id,
            x=float(xmin + ((ii + 0.5) / len(unit_ids)) * (xmax - xmin)), # fake location
            y=float(ymin + ((ii + 0.5) / len(unit_ids)) * (ymax - ymin))
        ))
    channel_locations = {}
    for ii, channel_id in enumerate(recording.channel_ids):
        channel_locations[str(channel_id)] = recording.get_channel_locations()[ii, :].astype(np.float32)
    view = vv.UnitLocations(
        units=unit_items,
        channel_locations=channel_locations,
        disable_auto_rotate=True,
        height=height
    )
    return view

if __name__ == '__main__':
    main()
