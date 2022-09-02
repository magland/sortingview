from typing import List
from .View import View


class MountainLayoutItem:
    def __init__(self, *,
        label: str,
        view: View,
        is_control: bool=False
    ) -> None:
        self.label = label
        self.view = view
        self.is_control = is_control

class MountainLayout(View):
    """
    MountainView layout
    """
    def __init__(self,
        items: List[MountainLayoutItem],
        **kwargs
    ) -> None:
        super().__init__('Mountain', is_layout=True, **kwargs)
        self._items = items
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'items': [
                item.view.to_dict() if item.view.is_layout else {'type': 'View', 'viewId': item.view.id}
                for item in self._items
            ],
            'itemProperties': [
                {
                    'label': item.label,
                    'isControl': item.is_control
                }
                for item in self._items
            ]
        }
        return ret
    def child_views(self) -> List[View]:
        return [item.view for item in self._items]
