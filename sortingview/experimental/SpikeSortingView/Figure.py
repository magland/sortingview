import os
from typing import Any, Union
import figurl as fig


class Figure:
    def __init__(self, *, data: Any, label: str) -> None:
        self._data = data
        self._label = label
    def url(self, channel: Union[str, None]=None):
        F = fig.Figure(
            view_url=os.getenv('SPIKESORTINGVIEW_URL', 'gs://figurl/spikesortingview-1'),
            data=self._data
        )
        return F.url(label=self._label, channel=channel)