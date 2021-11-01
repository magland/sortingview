import os
from typing import Any, Union


class Figure:
    def __init__(self, *, data: Any, label: str) -> None:
        self._data = data
        self._label = label
    def url(self, channel: Union[str, None]=None):
        import figurl as fig
        F = fig.Figure(
            view_url=os.getenv('SPIKESORTINGVIEW_URL', 'gs://figurl/spikesortingview-1'),
            data=self._data
        )
        return F.url(label=self._label, channel=channel)
    @property
    def data(self):
        return self._data
    @property
    def label(self):
        return self._label