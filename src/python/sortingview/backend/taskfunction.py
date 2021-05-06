from typing import Any, Callable, Dict, Union
import hither2 as hi

_global_registered_taskfunctions_by_function_id: Dict[str, Callable] = {}

def find_taskfunction(function_id: str) -> Union[Callable, None]:
    if function_id in _global_registered_taskfunctions_by_function_id:
        return _global_registered_taskfunctions_by_function_id[function_id]
    else:
        return None

def taskfunction(function_id: str):
    def wrap(f: Callable[..., Any]):
        print(f'Registering task: {function_id}')
        _global_registered_taskfunctions_by_function_id[function_id] = f
        return f
    return wrap