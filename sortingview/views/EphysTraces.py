from typing import List
from .View import View


class EphysTraces(View):
    """
    Raw ephys traces view
    """
    def __init__(self, *,
        format: str, # spikeinterface.binary
        uri: str,
        **kwargs
    ) -> None:
        super().__init__('EphysTraces', **kwargs)
        self._format = format
        self._uri = uri
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'format': self._format,
            'uri': self._uri
        }
        return ret
    def child_views(self) -> List[View]:
        return []