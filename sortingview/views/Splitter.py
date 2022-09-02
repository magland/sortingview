from typing import List, Literal
from .LayoutItem import LayoutItem
from .View import View


class Splitter(View):
    """
    Splitter layout - resizeable along the direction of the layout
    """
    def __init__(self,
        item1: LayoutItem,
        item2: LayoutItem,
        *,
        direction: Literal['horizontal', 'vertical'],
        **kwargs
    ) -> None:
        super().__init__('Splitter', is_layout=True, **kwargs)
        self._items = [item1, item2]
        self._direction = direction
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'direction': self._direction,
            'items': [
                item.view.to_dict() if item.view.is_layout else {'type': 'View', 'viewId': item.view.id}
                for item in self._items
            ],
            'itemProperties': [item.properties_dict() for item in self._items]
        }
        return ret
    def child_views(self) -> List[View]:
        return [item.view for item in self._items]
