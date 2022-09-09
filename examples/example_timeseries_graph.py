# 9/9/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-9&d=sha1://ef6660f3a74ff8b12ef4c5d29886b33cbaf77705&label=Timeseries%20graph%20example

import numpy as np
from typing import List
import sortingview.views as vv
import kachery_cloud as kcl


def main():
    kcl.use_sandbox()

    view = example_timeseries_graph()

    url = view.url(label='Timeseries graph example')
    print(url)

def example_timeseries_graph(*, height=500):
    # rng = np.random.default_rng(2022)
    G = TimeseriesGraph()

    n1 = 5000
    t = np.arange(0, n1) / n1 * 10
    v = t * np.cos((2 * t)**2)
    G.add_dataset(Dataset(
        name='1',
        data={
            't': t.astype(np.float32),
            'v': v.astype(np.float32)
        }
    ))
    n2 = 5000
    t = np.arange(0, n2) / n2 * 10
    v = t * np.cos((2 * t)**2)
    G.add_dataset(Dataset(
        name='2',
        data={
            't': t.astype(np.float32),
            'v': v.astype(np.float32)
        }
    ))
    G.add_series(Series(
        type='line',
        dataset='1',
        encoding={'t': 't', 'y': 'v'},
        attributes={'color': 'blue'}
    ))
    G.add_series(Series(
        type='line',
        dataset='1',
        encoding={'t': 't', 'y': 'v'},
        attributes={'color': 'blue'}
    ))
    G.add_series(Series(
        type='marker',
        dataset='2',
        encoding={'t': 't', 'y': 'v'},
        attributes={'color': 'green'}
    ))
    return G

class Dataset:
    def __init__(self, *, name: str, data: dict) -> None:
        self._name = name
        self._data = data
    def to_dict(self):
        return {
            'name': self._name,
            'data': self._data
        }

class Series:
    def __init__(self, *, type: str, dataset: str, encoding: dict, attributes: dict) -> None:
        self._type = type
        self._dataset = dataset
        self._encoding = encoding
        self._attributes = attributes
    def to_dict(self):
        return {
            'type': self._type,
            'dataset': self._dataset,
            'encoding': self._encoding,
            'attributes': self._attributes
        }

class TimeseriesGraph(vv.View):
    def __init__(self,
        **kwargs
    ) -> None:
        super().__init__('TimeseriesGraph', **kwargs)
        self._datasets = []
        self._series = []
    def add_dataset(self, ds: Dataset):
        self._datasets.append(ds)
    def add_series(self, s: Series):
        self._series.append(s)
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'datasets': [ds.to_dict() for ds in self._datasets],
            'series': [s.to_dict() for s in self._series]
        }
        return ret
    def child_views(self) -> List[vv.View]:
        return []

if __name__ == '__main__':
    main()
