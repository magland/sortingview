from typing import Any
import kachery_client as kc
from ..version import __version__

@kc.taskfunction('get_python_package_version.1', type='query')
def get_python_package_version():
    return __version__