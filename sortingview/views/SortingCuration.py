from typing import List
from .View import View


class SortingCuration(View):
    """
    Sorting curation control view
    """
    def __init__(self) -> None:
        super().__init__('SortingCuration')
    def to_dict(self) -> dict:
        ret = {
            'type': self.type
        }
        return ret
    def child_views(self) -> List[View]:
        return []
