# 8/31/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://056c59aae3f29f48426be38516a6e84496985edf&label=Position%20plot%20example

import numpy as np
import sortingview.views as vv
import kachery_cloud as kcl


def main():
    kcl.use_sandbox()
    view = example_position_plot()

    url = view.url(label='Position plot example')
    print(url)

def example_position_plot(*, height=600):
    timestamps = np.arange(1000, 2000, dtype=np.float64)
    n = len(timestamps)
    positions = np.zeros((n, 2))
    for i in range(n):
        positions[i, 0] = i + 3
        positions[i, 1] = timestamps[i] * np.cos(timestamps[i] * 2 * np.pi / 30)
    view = vv.PositionPlot(
        timestamps=timestamps,
        positions=positions.astype(np.float32),
        dimension_labels=['x', 'y'],
        height=height
    )
    return view

if __name__ == '__main__':
    main()
