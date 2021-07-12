from typing import Any
import kachery_client as kc
from ..version import __version__

@kc.taskfunction('sortingview_get_python_package_version.1', type='query')
def task_sortingview_get_python_package_version():
    return __version__