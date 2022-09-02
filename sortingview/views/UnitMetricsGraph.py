from typing import List, Literal, Union
from .View import View


class UnitMetricsGraphMetric:
    """
    Single metric
    """
    def __init__(self,
        key: str,
        label: str,
        dtype: Literal['int', 'float']
    ) -> None:
        self.key = key
        self.label = label
        self.dtype = dtype
    def to_dict(self):
        return {
            'key': self.key,
            'label': self.label,
            'dtype': self.dtype
        }

class UnitMetricsGraphUnit:
    """
    Single unit
    """
    def __init__(self,
        unit_id: Union[int, str],
        values: dict
    ) -> None:
        self.unit_id = unit_id
        self.values = values
    def to_dict(self):
        return {
            'unitId': self.unit_id,
            'values': self.values
        }

class UnitMetricsGraph(View):
    """
    Units table view
    """
    def __init__(self, *,
        metrics: List[UnitMetricsGraphMetric],
        units: List[UnitMetricsGraphUnit],
        **kwargs
    ) -> None:
        super().__init__('UnitMetricsGraph', **kwargs)
        self._metrics = metrics
        self._units = units
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'units': [a.to_dict() for a in self._units],
            'metrics': [a.to_dict() for a in self._metrics]
        }
        return ret
    def child_views(self) -> List[View]:
        return []
