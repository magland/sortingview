from copy import deepcopy
from abc import abstractmethod
from typing import List, Union
import kachery_cloud as kcl
import figurl as fig
import uuid
from ..sortingview_view_url import sortingview_view_url


class View:
    """
    Base class for all views
    """

    def __init__(self, view_type: str, *, is_layout: bool = False, height=500) -> None:
        self.type = view_type
        self.id = _random_id()
        self.is_layout = is_layout
        self._height = height
        # self._jupyter_widget = None
        self._selected_unit_ids = []
        self._sorting_curation = {}

    def set_id(self, id: str):
        self.id = id

    @abstractmethod
    def to_dict(self) -> dict:
        return {}

    @abstractmethod
    def child_views(self) -> List["View"]:
        return []

    @property
    def selected_unit_ids(self):
        return deepcopy(self._selected_unit_ids)

    def set_selected_unit_ids(self, ids: List[Union[int, str]]):
        raise Exception("Jupyter mode no longer supported")
        # if self._jupyter_widget is None:
        #     raise Exception('No jupyter widget')
        # self._jupyter_widget.send_message_to_frontend({
        #     'type': 'setSelectedUnitIds',
        #     'selectedUnitIds': ids
        # })

    @property
    def sorting_curation(self):
        return deepcopy(self._sorting_curation)

    def set_sorting_curation(self, sorting_curation):
        raise Exception("Jupyter mode no longer supported")
        # if self._jupyter_widget is None:
        #     raise Exception('No jupyter widget')
        # self._jupyter_widget.send_message_to_frontend({
        #     'type': 'setSortingCuration',
        #     'sortingCuration': sorting_curation
        # })

    def get_descendant_views_including_self(self):
        ret: List[View] = [self]
        for ch in self.child_views():
            a = ch.get_descendant_views_including_self()
            for v in a:
                ret.append(v)
        return ret

    def url_dict(self, *, label: str, state: Union[dict, None] = None, allow_float64: bool = False):
        from .Box import Box
        from .LayoutItem import LayoutItem

        if self.is_layout:
            all_views = self.get_descendant_views_including_self()
            # set the view IDs to make the figure deterministic
            for i, vv in enumerate(all_views):
                vv.set_id(f"{i}")
            data = {
                "type": "MainLayout",
                "layout": self.to_dict(),
                "views": [
                    {"type": view.type, "viewId": view.id, "dataUri": _upload_data_and_return_uri(view.to_dict(), allow_float64=allow_float64)}
                    for view in all_views
                    if not view.is_layout
                ],
            }
            view_url = sortingview_view_url
            F = fig.Figure(view_url=view_url, data=data, allow_float64=allow_float64)
            # if time_range is not None:
            #     if state is None:
            #         state = {}
            #     state['timeRange'] = time_range
            return F.url_dict(label=label, state=state)

        # Need to wrap it in a layout
        V = Box(direction="horizontal", items=[LayoutItem(self)])
        assert V.is_layout  # avoid infinite recursion
        return V.url_dict(label=label, state=state, allow_float64=allow_float64)

    def url(self, *, label: str, state: Union[dict, None] = None, allow_float64: bool = False):
        return fig.url_from_url_dict(self.url_dict(label=label, state=state, allow_float64=allow_float64))

    def jupyter(self, *, height: Union[int, None] = None):
        raise Exception("Jupyter mode no longer supported")
        # if height is None:
        #     height = self._height
        # import figurl_jupyter as fj
        # url = self.url(label='jupyter')
        # a = _parse_figurl_url(url)
        # view_uri = a['v']
        # data_uri = a['d']
        # views = self.get_descendant_views_including_self()
        # return fj.FigurlFigure(view_uri=view_uri, data_uri=data_uri, height=height)

    # Took me a while to figure out that
    # this is the right way to do it in order
    # to support both jupyter lab and notebook
    # I figure it out by looking into the ipywidgets
    # source code.
    # def _repr_mimebundle_(self, **kwargs):
    #     ipywidget = self.jupyter(height=self._height)
    #     data = ipywidget._repr_mimebundle_(**kwargs)
    #     self._set_jupyter_widget(ipywidget)
    #     return data
    # # This works in jupyter lab but not nb
    # def _ipython_display_(self):
    #     from IPython.display import display
    #     ipywidget = self.jupyter(height=self._height)
    #     self._set_jupyter_widget(ipywidget)
    #     display(ipywidget)
    # def run(self, *, label: str, port: int):
    #     if port == 0:
    #         # get an open port
    #         sock = socket.socket()
    #         sock.bind(("", 0))
    #         port = sock.getsockname()[1]
    #         sock.close()
    #     views = self.get_descendant_views_including_self()
    #     self.electron(label=label, listen_port=port)

    # def _set_jupyter_widget(self, W):
    #     self._jupyter_widget = W
    #     W.on_message_from_frontend(lambda message: self._on_message(message))
    def _on_message(self, message):
        type0 = message.get("type", "")
        if type0 == "setSelectedUnitIds":
            self._selected_unit_ids = message.get("selectedUnitIds", [])
        elif type0 == "setSortingCuration":
            self._sorting_curation = message.get("sortingCuration", {})


def _upload_data_and_return_uri(data, *, local: bool = False, allow_float64: bool = False):
    return kcl.store_json(fig.serialize_data(data, allow_float64=allow_float64), local=local)


def _random_id():
    return str(uuid.uuid4())[-12:]


def _parse_figurl_url(uri: str):
    ind = uri.index("?")
    q = uri[ind + 1 :]
    a = q.split("&")
    ret = {}
    for b in a:
        x = b.split("=")
        if len(x) == 2:
            ret[x[0]] = x[1]
    return ret
