import weakref
from typing import Any, Optional
import figurl as fig
from ..sortingview_view_url import sortingview_view_url

# Figures created in this process, so the figpack backend can convert a legacy
# MountainLayout (which only references its children by kachery hash) from the
# children's original data
_live_figures: "weakref.WeakSet[Figure]" = weakref.WeakSet()


class Figure:
    def __init__(self, *, data: Any, label: str) -> None:
        self._data = data
        self._label = label
        # important to define the figure here - because it does the check to see if the data is too large
        self._figure = fig.Figure(view_url=sortingview_view_url, data=self._data)
        _live_figures.add(self)

    def url(self):
        from .. import figpack_backend

        if figpack_backend.use_figpack():
            # SORTINGVIEW_BACKEND=figpack: publish to figpack instead of figurl
            figpack_url = figpack_backend.try_figpack_url_legacy(self)
            if figpack_url is not None:
                return figpack_url
        return self._figure.url(label=self._label)

    def get_serialized_figure_data(self):
        return self._figure._serialized_data

    @property
    def data(self):
        return self._data

    @property
    def label(self):
        return self._label


def find_live_figure(*, type: Optional[str], label: Optional[str]) -> Optional[Figure]:
    for f in list(_live_figures):
        if isinstance(f.data, dict) and f.data.get("type") == type and f.label == label:
            return f
    return None
