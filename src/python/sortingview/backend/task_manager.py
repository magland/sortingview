import time
import json
from typing import Callable, Dict
import hither2 as hi
from ._common import _upload_to_google_cloud
from ._serialize import _serialize

job_handler = hi.ParallelJobHandler(4)

@hi.function('return_42', '0.1.0')
def return_42(delay: float):
    time.sleep(delay)
    return {
        'answer': 42,
        'delay': delay
    }

# @taskfunction(function_id='test1')
# def task_test1(delay: float, dummy: Any):
#     with hi.Config(job_handler=job_handler):
#         return hi.Job(return_42, {'delay': delay})

# @hi.function('load_surface', '0.1.0')
# def load_surface(uri: str):
#     fname = kp.load_file(uri, p2p=False)
#     if fname is None:
#         raise Exception(f'Unable to find file: {uri}')
#     size = os.path.getsize(fname)
#     if size > 1000 * 1000 * 100:
#         raise Exception('File too large: {size} bytes')
    
#     return kp.load_object(uri, p2p=False)

# @taskfunction(function_id='load_surface')
# def task_load_surface(uri: str):
#     with hi.Config(job_handler=job_handler):
#         return hi.Job(load_surface, {'uri': uri})

class Task:
    def __init__(self, *, on_publish_message: Callable, google_bucket_name: str, task_hash: str, task_data: dict, job: hi.Job):
        self._on_publish_message = on_publish_message
        self._google_bucket_name = google_bucket_name
        self._task_hash = task_hash
        self._task_data = task_data
        self._status = job.status
        self._job = job
        self._publish_status_update()
    @property
    def status(self):
        return self._status
    @property
    def job(self):
        return self._job
    def iterate(self):
        if self._status != self._job.status:
            self._status = self._job.status
            self._publish_status_update()
    def _publish_status_update(self):
        msg = {'type': 'taskStatusUpdate', 'taskHash': self._task_hash, 'status': self._status}
        if self._status == 'error':
            msg['error'] = str(self._job.result.error)
        elif self._status == 'finished':
            return_value_serialized = _serialize(self._job.result.return_value)
            _upload_to_google_cloud(self._google_bucket_name, f'task_results/{_pathify_hash(self._task_hash)}', json.dumps(return_value_serialized).encode('utf-8'))
        self._on_publish_message(msg)

def _pathify_hash(x: str):
    return f'{x[0]}{x[1]}/{x[2]}{x[3]}/{x[4]}{x[5]}/{x}'

class TaskManager:
    def __init__(self, *, on_publish_message: Callable, google_bucket_name: str):
        self._tasks: Dict[str, Task] = {}
        self._on_publish_message = on_publish_message
        self._google_bucket_name = google_bucket_name
    def add_task(self, task_hash: str, task_data: dict, job: hi.Job):
        if task_hash in self._tasks:
            self._tasks[task_hash]._publish_status_update() # do this so the requester knows that it is already running
            return self._tasks[task_hash]
        t = Task(on_publish_message=self._on_publish_message, google_bucket_name=self._google_bucket_name, task_hash=task_hash, task_data=task_data, job=job)
        self._tasks[task_hash] = t
        return t
    def iterate(self):
        hi.wait(0)
        task_hashes = list(self._tasks.keys())
        for task_hash in task_hashes:
            task = self._tasks[task_hash]
            task.iterate()
            if task.status in ['error', 'finished']:
                del self._tasks[task_hash]