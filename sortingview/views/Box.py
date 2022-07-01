from typing import List, Literal, Union
from .LayoutItem import LayoutItem
from .View import View


class Box(View):
    def __init__(self,
        items: List[LayoutItem], *,
        direction: Literal['horizontal', 'vertical'],
        scrollbar: Union[None, bool] = None
    ) -> None:
        super().__init__('Box', is_layout=True)
        self._items = items
        self._direction = direction
        self._scrollbar = scrollbar
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
        if self._scrollbar is not None:
            ret['scrollbar'] = self._scrollbar
        return ret
    def child_views(self) -> List[View]:
        return [item.view for item in self._items]
