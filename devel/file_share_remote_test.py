from typing import Union
from kachery_cloud.TaskBackend import TaskClient
import kachery_cloud as kcl


# This script goes along with simple_file_sharing_backend.py
# Run this on a remote computer, or on a computer with a different kachery-cloud client than the backend
# You can set up an alternate kc client by creating a new directory
# and setting KACHERY_CLOUD_DIR env variable. You will need to run
# kachery-cloud-init for the new client.
#
# Note that once the file is in the kachery-cloud, it does not need to
# be uploaded anymore and so the task will not be requested.
# Thus the test only works once per file.

def main():
    uri = 'sha1://8a869c785d96167451abca2ca9c65e55aa462bce?label=README.md'
    project_id = 'lqhzprbdrq'
    fname = load_file(uri, project_id=project_id)
    print(f'Loaded file: {fname}')

def load_file(uri: str, *, project_id: str):
    task_client = TaskClient(project_id=project_id)
    try:
        fname = kcl.load_file(uri)
        print(f'File loaded without requesting upload task: {fname}')
        return fname
    except:
        pass
    print('Requesting upload task')
    task_client.request_task(
        task_type='action',
        task_name='kachery_store_shared_file.1',
        task_input={
            'uri': uri,
            'passcode': 'not-needed'
        }
    )
    print('Upload task completed')
    fname = kcl.load_file(uri)
    return fname

if __name__ == '__main__':
    main()