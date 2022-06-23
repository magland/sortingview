from typing import Union
from kachery_cloud.TaskBackend import TaskBackend
import kachery_cloud as kcl


# This is a simple example script demonstrating a backend service
# that will listen for requests on remote computers to upload files
# that are stored locally.
#
# You can store some content locally via
# uri = kcl.store_text_local('random-text-00001')
# Now this file is stored locally but not in the cloud
# On a remote computer you can send a request to upload
# the file. See the file_share_remote_test.py example
# and paste in the desired url and the project ID
# for this backend.

# uri is obtained from kcl.store_*_local(fname) on this computer
def kachery_store_shared_file(*, uri: str, passcode: str):
    # check passcode here
    # impose restrictions on uri here

    fname = kcl.load_file(uri, local_only=True) # requires kachery-cloud >= 0.1.18
    if fname is None:
        raise Exception(f'Unable to load file: {uri}')

    # impose restrictions on file here

    kcl.store_file(fname)

def start_backend(*, project_id: Union[str, None]=None):
    X = TaskBackend(project_id=project_id)
    X.register_task_handler(
        task_type='action',
        task_name='kachery_store_shared_file.1',
        task_function=kachery_store_shared_file
    )

    # Backend will listen for requests to upload a file to kachery cloud
    X.run()

if __name__ == '__main__':
    start_backend()