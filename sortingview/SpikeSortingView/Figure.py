import os
import kachery_cloud as kcl
from typing import Any
import figurl as fig


class Figure:
    def __init__(self, *, data: Any, label: str) -> None:
        self._data = data
        self._label = label
        # important to define the figure here - because it does the check to see if the data is too large
        self._figure = fig.Figure(
            view_url=os.getenv('SPIKESORTINGVIEW_URL', 'gs://figurl/spikesortingview-9'),
            data=self._data
        )
    def url(self):
        return self._figure.url(label=self._label, project_id=kcl.get_project_id())
    def electron(self):
        return self._figure.electron(label=self._label)
    def get_serialized_figure_data(self):
        return self._figure._serialized_data
    @property
    def data(self):
        return self._data
    @property
    def label(self):
        return self._label