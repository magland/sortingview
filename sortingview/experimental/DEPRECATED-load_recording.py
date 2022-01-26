from typing import Union
from ..extractors.wrapperrecordingextractor.create_recording_from_old_extractor import create_recording_from_old_extractor
from ..extractors.labboxephysrecordingextractor import LabboxEphysRecordingExtractor


def load_recording(recording_object_or_uri: Union[str, dict], *, download=False):
    R = LabboxEphysRecordingExtractor(recording_object_or_uri, download=download)
    return create_recording_from_old_extractor(R)