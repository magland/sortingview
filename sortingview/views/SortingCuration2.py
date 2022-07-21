from typing import List
from .View import View


class SortingCuration2(View):
    """
    Sorting curation v2 control view
    """
    def __init__(self, *, sorting_id: str) -> None:
        super().__init__('SortingCuration2')
        self._sorting_id = sorting_id
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'sortingId': self._sorting_id
        }
        return ret
    def child_views(self) -> List[View]:
        return []
