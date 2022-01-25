import os
from typing import List, Union
import kachery_client as kc
from .Figure import Figure


class MultiTimeseries:
    def __init__(self, *, label: str) -> None:
        self._label = label
        self._panels = []
    def add_panel(self, figure: Figure, *, relative_height: Union[float, None]=None):
        self._panels.append({
            'figure': figure,
            'relative_height': relative_height
        })
    def get_composite_figure(self):
        if not os.getenv('FIGURL_CHANNEL'):
            raise Exception('Environment variable not set: FIGURL_CHANNEL')
        panels = []
        for p in self._panels:
            fig0: Figure = p['figure']
            v = {
                'type': fig0.data['type'],
                'label': fig0.label,
                'figureDataSha1': _upload_data_and_return_sha1(fig0.get_serialized_figure_data())
            }
            if p['relative_height'] is not None:
                v['relativeHeight'] = p['relative_height']
            panels.append(v)    
        data = {
            'type': 'MultiTimeseries',
            'panels': panels
        }
        return Figure(data=data, label=self._label)

def _upload_data_and_return_sha1(data):
    data_uri = kc.store_json(data)
    data_hash = data_uri.split('/')[2]
    kc.upload_file(data_uri, channel=os.environ['FIGURL_CHANNEL'], single_chunk=True)
    return data_hash