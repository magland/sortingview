import os
import json
import kachery_client as kc

thisdir = os.path.dirname(os.path.realpath(__file__))
with open(thisdir + '/task_function_ids.json', 'r') as f:
    task_function_ids = json.load(f)

def start_backend(*, channel: str):
    # register the tasks
    from ..tasks import dummy
    from ..gui.extensions import dummy

    kc.run_task_backend(
        channels=[channel],
        task_function_ids=task_function_ids
    )