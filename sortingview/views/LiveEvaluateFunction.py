import time
from typing import Callable, List
from .View import View
from kachery_cloud.TaskBackend import TaskBackend


class LiveEvaluateFunction(View):
    """
    Live evaluate function
    """
    def __init__(self,
        function: Callable,
        function_id: str,
        **kwargs
    ) -> None:
        super().__init__('LiveEvaluateFunction', **kwargs)
        self._function = function
        self._function_id = function_id
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'functionId': self._function_id
        }
        return ret
    def register_task_handlers(self, task_backend: TaskBackend):
        task_name = f'function.{self._function_id}'
        task_backend.register_task_handler(task_type='calculation', task_name=task_name, task_function=self._function)
    def child_views(self) -> List[View]:
        return []
