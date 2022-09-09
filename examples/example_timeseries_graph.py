# 9/9/22
# https://www.figurl.org/f?v=gs://figurl/spikesortingview-9&d=sha1://e5683f7e0ac5cb6958e62ea37099c1ba8af4ce51&label=Timeseries%20graph%20example

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

    n1 = 5000
    t = np.arange(0, n1) / n1 * 10
    v = t * np.cos((2 * t)**2)
    G.add_line_series(name='1', t=t.astype(np.float32), y=v.astype(np.float32), color='blue')

    n2 = 5000
    t = np.arange(0, n2) / n2 * 10
    v = t * np.cos((2 * t)**2)
    G.add_marker_series(name='2', t=t.astype(np.float32), y=v.astype(np.float32), color='red')

    return G

if __name__ == '__main__':
    main()
