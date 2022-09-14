from typing import List
from .View import View
from kachery_cloud.TaskBackend import TaskBackend


class Annotations(View):
    """
    Annotations
    """
    def __init__(self,
        **kwargs
    ) -> None:
        super().__init__('Annotations', **kwargs)
    def to_dict(self) -> dict:
        ret = {
            'type': self.type
        }
        return ret
    def register_task_handlers(self, task_backend: TaskBackend):
        return super().register_task_handlers(task_backend)
    def child_views(self) -> List[View]:
        return []
