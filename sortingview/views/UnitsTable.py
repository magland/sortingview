import numpy as np
from typing import List, Literal, Union
from .View import View


class UnitsTableColumn:
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

class UnitsTableRow:
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

class UnitsTable(View):
    def __init__(self, *,
        columns: List[UnitsTableColumn],
        rows: List[UnitsTableRow]
    ) -> None:
        super().__init__('UnitsTable')
        self._columns = columns
        self._rows = rows
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'columns': [a.to_dict() for a in self._columns],
            'rows': [a.to_dict() for a in self._rows]
        }
        return ret
    def child_views(self) -> List[View]:
        return []
