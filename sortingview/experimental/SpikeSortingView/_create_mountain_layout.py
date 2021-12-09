import os
from typing import List, Union
import kachery_client as kc
from .Figure import Figure


def create_mountain_layout(self, *, figures: List[Figure], label: Union[str, None]=None, sorting_curation_uri: Union[str, None]=None):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    if label is None:
        label = 'SpikeSortingView'
    
    data = {
        'type': 'MountainLayout',
        'views': [
            {
                'type': fig0.data['type'],
                'label': fig0.label,
                'figureDataSha1': _upload_data_and_return_sha1(fig0.get_serialized_figure_data())
            }
            for fig0 in figures
        ]
    }
    if sorting_curation_uri is not None:
        data['sortingCurationUri'] = sorting_curation_uri
    return Figure(data=data, label=label)

def _upload_data_and_return_sha1(data):
    data_uri = kc.store_json(data)
    data_hash = data_uri.split('/')[2]
    kc.upload_file(data_uri, channel=os.environ['FIGURL_CHANNEL'])
    return data_hash