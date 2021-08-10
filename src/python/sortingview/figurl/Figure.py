import os
from typing import Any, Union
import kachery_client as kc
from ..serialize_wrapper import _serialize

class Figure:
    def __init__(self, type: str, data: Any):
        self._type = type
        self._data = data
        self._object = {'type': type, 'data': data}
        self._object_uri: Union[str, None] = None
    @property
    def object(self):
        return self._object
    @property
    def type(self):
        return self._type
    @property
    def data(self):
        return self._data
    def url(self, *, channel: Union[str, None]=None, base_url: Union[str, None]=None):
        if base_url is None:
            base_url = default_base_url
        if channel is None:
            if default_channel is None:
                raise Exception('No channel specified and FIGURL_CHANNEL is not set.')
            channel = default_channel
        if self._object_uri is None:
            self._object_uri = store_json(self._object)
        object_hash = self._object_uri.split('/')[2]
        url = f'{base_url}/fig?channel={channel}&figureObject={object_hash}'
        return url

def store_json(x: dict):
    return kc.store_json(_serialize(x))

default_base_url = os.getenv('FIGURL_BASE_URL', 'https://sortingview.vercel.app')
default_channel = os.getenv('FIGURL_CHANNEL', None)