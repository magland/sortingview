import labbox_ephys as le
import hither2 as hi
import kachery_p2p as kp
from ..backend import taskfunction
from .job_handler import job_handler
from .job_cache import job_cache

@hi.function('example_workspaces', '0.1.1')
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
    with hi.Config(job_handler=job_handler, job_cache=None):
        return hi.Job(example_workspaces, {})

@hi.function('workspace_list_subfeed', '0.1.0')
def workspace_list_subfeed():
    f = kp.load_feed('sortingview-workspace-list', create=True)
    return f.get_subfeed('workspace-list').get_uri()

@taskfunction('workspace_list_subfeed.1')
def task_workspace_list_subfeed(cachebust: str):
    with hi.Config(job_handler=job_handler.misc, job_cache=None):
        return hi.Job(workspace_list_subfeed, {})

def set_workspace_list(workspace_list):
    uri = workspace_list_subfeed()
    sf = kp.load_subfeed(uri)
    print(sf.get_uri())
    print(sf.get_subfeed_hash())
    # sf.append_message(workspace_list)