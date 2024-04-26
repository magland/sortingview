from typing import List, Literal
from .View import View


class TabLayoutItem:
    def __init__(self, *, label: str, view: View) -> None:
        self.label = label
        self.view = view


class TabLayout(View):
    """
    Tab layout
    """

    def __init__(self, items: List[TabLayoutItem], tab_bar_layout: Literal['horizontal', 'vertical'] = 'horizontal', **kwargs) -> None:
        super().__init__("TabLayout", is_layout=True, **kwargs)
        self._items = items
        self._tab_bar_layout = tab_bar_layout

    def to_dict(self) -> dict:
        ret = {
            "type": self.type,
            "items": [item.view.to_dict() if item.view.is_layout else {"type": "View", "viewId": item.view.id} for item in self._items],
            "itemProperties": [{"label": item.label} for item in self._items]
        }
        if self._tab_bar_layout != "horizontal":
            ret["tabBarLayout"] = self._tab_bar_layout
        return ret

    def child_views(self) -> List[View]:
        return [item.view for item in self._items]
