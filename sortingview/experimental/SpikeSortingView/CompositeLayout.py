import os
from typing import List, Union
import kachery_client as kc
from .Figure import Figure


class CompositeLayout:
    def __init__(self, *, label: str) -> None:
        self._label = label
        self._figures = []
    def add_figure(self, figure: Figure, *, default_width: Union[int, None]=None, default_height: Union[int, None]=None):
        self._figures.append({
            'figure': figure,
            'default_width': default_width,
            'default_height': default_height
        })
    def get_composite_figure(self):
        if not os.getenv('FIGURL_CHANNEL'):
            raise Exception('Environment variable not set: FIGURL_CHANNEL')
        views = []
        for f in self._figures:
            fig0: Figure = f['figure']
            v = {
                'type': fig0.data['type'],
                'label': fig0.label,
                'figureDataSha1': _upload_data_and_return_sha1(fig0.get_serialized_figure_data())
            }
            if f['default_height'] is not None:
                v['defaultHeight'] = f['default_height']
            views.append(v)    
        data = {
            'type': 'Composite',
            'layout': 'default',
            'views': views
        }
        return Figure(data=data, label=self._label)

def _upload_data_and_return_sha1(data):
    data_uri = kc.store_json(data)
    data_hash = data_uri.split('/')[2]
    kc.upload_file(data_uri, channel=os.environ['FIGURL_CHANNEL'])
    return data_hash