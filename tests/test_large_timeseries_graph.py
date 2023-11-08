# 9/30/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-10&d=sha1://dfb82b18910ba97aa30ef299cc5fd2cd0f9dbe08&label=Timeseries%20graph%20example

import numpy as np
import sortingview.views as vv
import kachery_cloud as kcl


def main():
    kcl.use_sandbox()

    view = test_large_timeseries_graph()

    url = view.url(label="Timeseries graph example")
    print(url)


def test_large_timeseries_graph(*, height=500):
    # rng = np.random.default_rng(2022)
    G = vv.TimeseriesGraph(legend_opts={"location": "northwest"})

    # this is for testing the time offset feature
    t0 = 2000000

    n1 = 2e6
    t = np.arange(0, n1) / n1 * 50
    v = t * np.cos((2 * t) ** 2)
    G.add_line_series(name="blue line", t=t0 + t, y=v.astype(np.float32), color="blue")

    n2 = 2e3
    t = np.arange(0, n2) / n2 * 50
    v = t * np.cos((2 * t) ** 2)
    G.add_marker_series(name="red marker", t=t0 + t, y=v.astype(np.float32), color="red", radius=4)

    v = t + 1
    G.add_line_series(name="green dash", t=t0 + t, y=v.astype(np.float32), color="green", width=5, dash=[12, 8])

    t = np.arange(0, 12) / 12 * 50
    v = -t - 1
    G.add_marker_series(name="black marker", t=t0 + t, y=v.astype(np.float32), color="black", radius=8, shape="square")

    return G


if __name__ == "__main__":
    main()
