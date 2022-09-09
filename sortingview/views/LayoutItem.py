from typing import Union
from .View import View


class LayoutItem:
    """
    A layout item - wraps a view inside a layout
    """
    def __init__(self,
        view: View, *,
        min_size: Union[None, float]=None,
        max_size: Union[None, float]=None,
        stretch: Union[None, float]=None,
        title: Union[None, str]=None
    ) -> None:
        self.view = view
        self.min_size = min_size
        self.max_size = max_size
        self.stretch = stretch
        self.title = title
    def properties_dict(self):
        ret = {}
        if self.min_size is not None:
            ret['minSize'] = self.min_size
        if self.max_size is not None:
            ret['maxSize'] = self.max_size
        if self.stretch is not None:
            ret['stretch'] = self.stretch
        if self.title is not None:
            ret['title'] = self.title
        return ret
