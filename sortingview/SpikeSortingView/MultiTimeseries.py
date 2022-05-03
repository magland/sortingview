import os
from typing import Union
import kachery_cloud as kcl
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
        panels = []
        for p in self._panels:
            fig0: Figure = p['figure']
            v = {
                'type': fig0.data['type'],
                'label': fig0.label,
                'figureDataUri': _upload_data_and_return_uri(fig0.get_serialized_figure_data())
            }
            if p['relative_height'] is not None:
                v['relativeHeight'] = p['relative_height']
            panels.append(v)    
        data = {
            'type': 'MultiTimeseries',
            'panels': panels
        }
        return Figure(data=data, label=self._label)

def _upload_data_and_return_uri(data):
    data_uri = kcl.store_json(data)
    return data_uri