from typing import List, Union
from .helpers.compute_correlogram_data import compute_correlogram_data
from .Figure import Figure


def create_live_cross_correlograms(self, *, label: Union[str, None]=None):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    if label is None:
        label = 'Cross correlograms'

    data = {
        'type': 'LiveCrossCorrelograms',
        'unitIds': self.unit_ids,
        'dataUri': self.data_uri
    }
    return Figure(data=data, label=label)