# 8/31/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://4e6be9c721aab52acd7863b6b6e58dc666cfb8ea&label=Spike%20locations%20example

import numpy as np
from typing import List
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se
import kachery_cloud as kcl


def main():
    kcl.use_sandbox()
    recording, sorting = se.toy_example(num_units=12, num_channels=10, duration=300, seed=0)

    view = example_spike_locations(recording=recording, sorting=sorting, hide_unit_selector=False)

    url = view.url(label='Spike locations example')
    print(url)

def example_spike_locations(*, recording: si.BaseRecording, sorting: si.BaseSorting, hide_unit_selector: bool=False, height=500):
    channel_locations = recording.get_channel_locations().astype(np.float32)
    xmin = np.min(channel_locations[:, 0])
    xmax = np.max(channel_locations[:, 0])
    ymin = np.min(channel_locations[:, 1])
    ymax = np.max(channel_locations[:, 1])
    xspan = xmax - xmin
    yspan = ymax - ymin
    if xmax <= xmin:
        xmin = xmin - 12
        xmax = xmax + 12
    if ymax <= ymin:
        ymin = ymin - 12
        ymax = ymax + 12
    # expand ranges
    xspan = xmax - xmin
    yspan = ymax - ymin
    xmin = xmin - xspan * 0.2
    xmax = xmax + xspan * 0.2
    ymin = ymin - yspan * 0.2
    ymax = ymax + yspan * 0.2

    rng = np.random.default_rng(2022)
    items: List[vv.SpikeLocationsItem] = []
    for unit_id in sorting.get_unit_ids():
        spike_times_sec = np.array(sorting.get_unit_spike_train(segment_index=0, unit_id=unit_id)) / sorting.get_sampling_frequency()
        center_x = rng.uniform(xmin, xmax) # fake center for unit
        center_y = rng.uniform(ymin, ymax) # fake center for unit
        items.append(
            vv.SpikeLocationsItem(
                unit_id=unit_id,
                spike_times_sec=spike_times_sec.astype(np.float32),
                x_locations=rng.normal(center_x, 6, spike_times_sec.shape).astype(np.float32), # fake locations
                y_locations=rng.normal(center_y, 6, spike_times_sec.shape).astype(np.float32)  # fake locations
            )
        )

    view = vv.SpikeLocations(
        units=items,
        hide_unit_selector=hide_unit_selector,
        x_range=[xmin, xmax],
        y_range=[ymin, ymax],
        channel_locations=channel_locations,
        disable_auto_rotate=True,
        height=height
    )
    return view

if __name__ == '__main__':
    main()
