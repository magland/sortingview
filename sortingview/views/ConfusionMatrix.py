from typing import List, Union
from .View import View


class UnitEventCount:
    def __init__(self,
        unit_id: Union[int, str],
        count: int
    ) -> None:
        self.unit_id = unit_id
        self.count = count
    def to_dict(self):
        return {
            'unitId': self.unit_id,
            'count': self.count
        }

class MatchingUnitEventCount:
    def __init__(self,
        unit_id1: Union[int, str],
        unit_id2: Union[int, str],
        count: int
    ) -> None:
        self.unit_id1 = unit_id1
        self.unit_id2 = unit_id2
        self.count = count
    def to_dict(self):
        return {
            'unitId1': self.unit_id1,
            'unitId2': self.unit_id2,
            'count': self.count
        }

class ConfusionMatrix(View):
    """
    Confusion matrix view
    """
    def __init__(self, *,
        sorting1_unit_ids: List[Union[str, int]],
        sorting2_unit_ids: List[Union[str, int]],
        unit_event_counts: List[UnitEventCount],
        matching_unit_event_counts: List[MatchingUnitEventCount],
        **kwargs
    ) -> None:
        super().__init__('ConfusionMatrix', **kwargs)
        self.sorting1_unit_ids = sorting1_unit_ids
        self.sorting2_unit_ids = sorting2_unit_ids
        self.unit_event_counts = unit_event_counts
        self.matching_unit_event_counts = matching_unit_event_counts
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'sorting1UnitIds': self.sorting1_unit_ids,
            'sorting2UnitIds': self.sorting2_unit_ids,
            'unitEventCounts': [a.to_dict() for a in self.unit_event_counts],
            'matchingUnitEventCounts': [a.to_dict() for a in self.matching_unit_event_counts]
        }
        return ret
    def child_views(self) -> List[View]:
        return []
