from typing import List, Union, Dict, Any
from .View import View


# The sorting_id parameter can be any string.
# It should uniquely point to a sorting so that the saved curation can be associated with that sorting


class SortingCuration2(View):
    """
    Sorting curation v2 control view
    """

    def __init__(self, *, label_choices: Union[None, list] = None, **kwargs) -> None:
        super().__init__("SortingCuration2", **kwargs)
        self._label_choices = label_choices

    def to_dict(self) -> dict:
        ret: Dict[str, Any] = {"type": self.type}
        if self._label_choices is not None:
            ret["labelChoices"] = self._label_choices
        return ret

    def child_views(self) -> List[View]:
        return []
