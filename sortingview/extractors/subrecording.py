from typing import List, Union
from .labboxephysrecordingextractor import LabboxEphysRecordingExtractor

def subrecording(*, recording: LabboxEphysRecordingExtractor, channel_ids: Union[List[int], None]=None, start_frame: Union[int, None]=None, end_frame: Union[int, None]=None):
    data = {
        'recording': recording.object(),
    }
    if channel_ids is not None:
        data['channel_ids'] = channel_ids
    if start_frame is not None:
        data['start_frame'] = start_frame
        assert end_frame is not None
    if end_frame is not None:
        data['end_frame'] = end_frame
        assert start_frame is not None
    return LabboxEphysRecordingExtractor({
        'recording_format': 'subrecording',
        'data': data
    })