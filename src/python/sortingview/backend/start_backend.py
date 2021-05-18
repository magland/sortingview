import os
import time
from .backend import Backend

def start_backend(*, app_url: str, label: str):
    # register the tasks
    from ..tasks import dummy
    from ..gui.extensions import dummy

    # For uploading to google bucket
    GOOGLE_BUCKET_NAME = os.getenv('GOOGLE_BUCKET_NAME', None)
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', None)
    if GOOGLE_BUCKET_NAME is None:
        raise Exception(f'Environment variable not set: GOOGLE_BUCKET_NAME')
    if GOOGLE_APPLICATION_CREDENTIALS is None:
        raise Exception(f'Environment variable not set: GOOGLE_APPLICATION_CREDENTIALS')
    if not os.path.isfile(GOOGLE_APPLICATION_CREDENTIALS):
        raise Exception(f'Google application credentials file not found: {GOOGLE_APPLICATION_CREDENTIALS}')
    
    X = Backend(google_bucket_name=GOOGLE_BUCKET_NAME, app_url=app_url, label=label)
    try:
        while True:
            X.iterate()
            time.sleep(0.1)
    finally:
        X.cleanup()