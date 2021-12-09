import os
from typing import Any, Union
import figurl as fig


class Figure:
    def __init__(self, *, data: Any, label: str) -> None:
        self._data = data
        self._label = label
        # important to define the figure here - because it does the check to see if the data is too large
        self._figure = fig.Figure(
            view_url=os.getenv('SPIKESORTINGVIEW_URL', 'gs://figurl/spikesortingview-1'),
            data=self._data
        )
    def url(self, channel: Union[str, None]=None):
        return self._figure.url(label=self._label, channel=channel)
    def get_serialized_figure_data(self):
        return self._figure._serialized_data
    @property
    def data(self):
        return self._data
    @property
    def label(self):
        return self._label