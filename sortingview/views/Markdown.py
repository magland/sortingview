from typing import List
from .View import View


class Markdown(View):
    """
    Markdown
    """
    def __init__(self,
        source: str,
        **kwargs
    ) -> None:
        super().__init__('Markdown', **kwargs)
        self._source = source
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'source': self._source
        }
        return ret
    def child_views(self) -> List[View]:
        return []
