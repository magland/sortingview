from typing import List
from .View import View


class TabLayoutItem:
    def __init__(self, *,
        label: str,
        view: View
    ) -> None:
        self.label = label
        self.view = view

class TabLayout(View):
    """
    Tab layout
    """
    def __init__(self,
        items: List[TabLayoutItem],
        **kwargs
    ) -> None:
        super().__init__('TabLayout', is_layout=True, **kwargs)
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
                    'label': item.label
                }
                for item in self._items
            ]
        }
        return ret
    def child_views(self) -> List[View]:
        return [item.view for item in self._items]
