from typing import Tuple
import kachery_cloud as kcl


def trythis_load_sorting_curation(
    sorting_curation_uri: str
) -> Tuple[str, str]:
    x = kcl.load_json(sorting_curation_uri)
    if x is None:
        raise Exception('Unable to load sorting curation')
    return x