from typing import Union
from ..extractors.wrapperrecordingextractor.create_sorting_from_old_extractor import create_sorting_from_old_extractor
from ..extractors.labboxephyssortingextractor import LabboxEphysSortingExtractor


def load_sorting(sorting_object_or_uri: Union[str, dict]):
    S = LabboxEphysSortingExtractor(sorting_object_or_uri)
    return create_sorting_from_old_extractor(S)