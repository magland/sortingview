from google.oauth2 import id_token
import cachecontrol
import google.auth.transport.requests
import requests

session = requests.session()
cached_session = cachecontrol.CacheControl(session)
request = google.auth.transport.requests.Request(session=cached_session)

def _verify_oauth2_token(token: bytes):
    id_info = id_token.verify_oauth2_token(token, request)
    return id_info