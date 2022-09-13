# 9/9/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-9&d=sha1://f649d425bb2f3480034dbd8bfc10425157083513&label=Timeseries%20graph%20example

import numpy as np
import sortingview.views as vv
import kachery_cloud as kcl


def main():
    kcl.use_sandbox()

    view = example_timeseries_graph()

    url = view.url(label='Timeseries graph example')
    print(url)

def example_timeseries_graph(*, height=500):
    # rng = np.random.default_rng(2022)
    G = vv.TimeseriesGraph()

    # this is for testing the time offset feature
    t0 = 1000000

    n1 = 5000
    t = np.arange(0, n1) / n1 * 10
    v = t * np.cos((2 * t)**2)
    G.add_line_series(name='1', t=t0 + t, y=v.astype(np.float32), color='blue')

    n2 = 400
    t = np.arange(0, n2) / n2 * 10
    v = t * np.cos((2 * t)**2)
    G.add_marker_series(name='2', t=t0 + t, y=v.astype(np.float32), color='red', radius=4)

    v = t + 1
    G.add_line_series(name='3', t=t0 + t, y=v.astype(np.float32), color='green', width=5, dash=[12, 8])

    t = np.arange(0, 12) / 12 * 10
    v = -t - 1
    G.add_marker_series(name='4', t=t0 + t, y=v.astype(np.float32), color='black', radius=8, shape='square')

    return G

if __name__ == '__main__':
    main()
