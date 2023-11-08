from typing import List, Union
from .View import View


class EphysTraces(View):
    """
    Raw ephys traces view
    """

    def __init__(self, *, format: str, uri: str, sorting_uri: Union[str, None] = None, **kwargs) -> None:  # spikeinterface.binary
        super().__init__("EphysTraces", **kwargs)
        self._format = format
        self._uri = uri
        self._sorting_uri = sorting_uri

    def to_dict(self) -> dict:
        ret = {"type": self.type, "format": self._format, "uri": self._uri}
        if self._sorting_uri is not None:
            ret["sortingUri"] = self._sorting_uri
        return ret

    def child_views(self) -> List[View]:
        return []
