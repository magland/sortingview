from typing import List, Union
from .View import View


class MountainLayoutItem:
    def __init__(self, *,
        label: str,
        view: View,
        is_control: bool=False,
        control_height: Union[None, int]=None
    ) -> None:
        self.label = label
        self.view = view
        self.is_control = is_control
        self.control_height = control_height

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
        item_properties = []
        for item in self._items:
            ip = {
                'label': item.label,
                'isControl': item.is_control
            }
            if item.control_height is not None:
                ip['controlHeight'] = item.control_height
            item_properties.append(ip)
        ret = {
            'type': self.type,
            'items': [
                item.view.to_dict() if item.view.is_layout else {'type': 'View', 'viewId': item.view.id}
                for item in self._items
            ],
            'itemProperties': item_properties
        }
        return ret
    def child_views(self) -> List[View]:
        return [item.view for item in self._items]
