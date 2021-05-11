from typing import Union
import requests
from google.cloud import storage

def _http_json_post(url: str, obj: dict):
    r = requests.post(url, json=obj)
    try:
        assert r.status_code == 200, f'Problem posting data to: {url}: {str(r)}'
        return r.json()
    finally:
        r.close()
class _global:
    storage_client: Union[storage.Client, None] = None

def _upload_to_google_cloud(bucket_name: str, destination_name: str, data: bytes, *, replace=True):
    if _global.storage_client is None:
        _global.storage_client = storage.Client()
    bucket = _global.storage_client.bucket(bucket_name)
    if not replace:
        if bucket.get_blob(destination_name) is not None:
            return

    blob = bucket.blob(destination_name)

    blob.upload_from_string(data)