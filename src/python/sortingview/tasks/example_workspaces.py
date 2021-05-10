import labbox_ephys as le
import hither2 as hi
from ..backend import taskfunction
from .job_handler import job_handler
from .job_cache import job_cache

@hi.function('example_workspaces', '0.1.0')
def example_workspaces():
    w = le.load_workspace('default')
    return [
        {
            'workspaceUri': w.get_uri(),
            'workspaceLabel': 'default'
        }
    ]

@taskfunction('example_workspaces.1')
def task_example_workspaces(cachebust: str):
    with hi.Config(job_handler=job_handler, job_cache=job_cache):
        return hi.Job(example_workspaces, {})