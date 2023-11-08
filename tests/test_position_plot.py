# 8/24/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://e0bae03313f4183674ce61d18281de1082241eba&label=test_position_plot

import numpy as np
import sortingview.views as vv


def main():
    view = test_position_plot()

    url = view.url(label="test_position_plot")
    print(url)


def test_position_plot():
    timestamps = np.arange(1000, 2000, dtype=np.float64)
    n = len(timestamps)
    positions = np.zeros((n, 2))
    for i in range(n):
        positions[i, 0] = i + 3
        positions[i, 1] = timestamps[i] * np.cos(timestamps[i] * 2 * np.pi / 30)
    view = vv.PositionPlot(timestamps=timestamps, positions=positions.astype(np.float32), dimension_labels=["x", "y"])
    return view


if __name__ == "__main__":
    main()
