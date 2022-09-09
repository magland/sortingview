from typing import List
from .View import View


class TGDataset:
    def __init__(self, *, name: str, data: dict) -> None:
        self._name = name
        self._data = data
    def to_dict(self):
        return {
            'name': self._name,
            'data': self._data
        }

class TGSeries:
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

class TimeseriesGraph(View):
    def __init__(self,
        **kwargs
    ) -> None:
        super().__init__('TimeseriesGraph', **kwargs)
        self._datasets = []
        self._series = []
    def add_dataset(self, ds: TGDataset):
        self._datasets.append(ds)
    def add_series(self, s: TGSeries):
        self._series.append(s)
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'datasets': [ds.to_dict() for ds in self._datasets],
            'series': [s.to_dict() for s in self._series]
        }
        return ret
    def child_views(self) -> List[View]:
        return []