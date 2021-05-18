import labbox_ephys as le
import hither2 as hi
import kachery_p2p as kp
from ..backend import taskfunction
from sortingview.config import job_cache, job_handler
from sortingview.workspace_list import WorkspaceList

@hi.function('workspace_list_subfeed', '0.1.0')
def workspace_list_subfeed(backend_uri):
    W = WorkspaceList(backend_uri=backend_uri)
    return W.get_subfeed_uri()

@taskfunction('workspace_list_subfeed.2')
def task_workspace_list_subfeed(backend_uri: str, cachebust: str):
    with hi.Config(job_handler=job_handler.misc, job_cache=None):
        return hi.Job(workspace_list_subfeed, {'backend_uri': backend_uri})

# def set_workspace_list(workspace_list):
#     uri = workspace_list_subfeed()
#     sf = kp.load_subfeed(uri)
#     print(sf.get_uri())
#     print(sf.get_subfeed_hash())
#     sf.append_message(workspace_list)