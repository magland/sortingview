from typing import List, Union
from .labboxephyssortingextractor import LabboxEphysSortingExtractor

def subsorting(*, sorting: LabboxEphysSortingExtractor, unit_ids: Union[List[int], None]=None, start_frame: Union[int, None]=None, end_frame: Union[int, None]=None):
    data = {
        'sorting': sorting.object(),
    }
    if unit_ids is not None:
        data['unit_ids'] = unit_ids
    if start_frame is not None:
        data['start_frame'] = start_frame
        assert end_frame is not None
    if end_frame is not None:
        data['end_frame'] = end_frame
        assert start_frame is not None
    return LabboxEphysSortingExtractor({
        'sorting_format': 'subsorting',
        'data': data
    })