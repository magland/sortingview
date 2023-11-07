from typing import List
from sortingview.views import View
from kachery_cloud.TaskBackend import TaskBackend
from time import time


def main():
    lines = [
        {'text': f'Example line {ind}', 'timestamp': time(), 'stderr': False}
        for ind in range(100)
    ]
    view = Console(lines)
    print(view.url(label='Console example'))

class Console(View):
    """
    Minimalistic example view
    """
    def __init__(self,
        lines: List[dict], # {text, timestamp, stderr}
        **kwargs
    ) -> None:
        super().__init__('Console', **kwargs)
        self._lines = lines
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'consoleLines': self._lines
        }
        return ret
    def register_task_handlers(self, task_backend: TaskBackend):
        return super().register_task_handlers(task_backend)
    def child_views(self) -> List[View]:
        return []

if __name__ == '__main__':
    main()