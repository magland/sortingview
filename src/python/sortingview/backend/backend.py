import time
import json
import uuid
import hashlib
from typing import Callable, Dict, List, Union, cast
import kachery_p2p as kp
from ..version import __version__
from ._verify_oauth2_token import _verify_oauth2_token

from .subfeed_manager import SubfeedManager

from .task_manager import TaskManager
from .taskfunction import find_taskfunction
from ._common import _http_json_post, _upload_to_google_cloud
import paho.mqtt.client as mqtt

class AblyClient:
    def __init__(self, on_ably_message: Callable):
        self._on_ably_message = on_ably_message
        self._client: Union[None, mqtt.Client] = None
    def reconnect(self, client_channel_name: str, token_details: dict):
        old_client = self._client
        self._client = mqtt.Client()
        client = self._client
        client.username_pw_set(token_details['token'], '')
        client.tls_set()
        def on_connect(client, userdata, flags, rc):
            client.subscribe(client_channel_name)
            print('Ably client connected')
        def on_disconnect(client, userdata, rc):
            if self._client == client:
                print('Ably client disconnected')
        def on_message(client0, userdata, message: mqtt.MQTTMessage):
            self._on_ably_message(json.loads(message.payload.decode('utf-8')))
        client.on_connect = on_connect
        client.on_disconnect = on_disconnect
        client.on_message = on_message
        client.connect('mqtt.ably.io', port=8883, keepalive=15)
        client.loop_start()

        if old_client is not None:
            old_client.loop_stop()
            old_client.disconnect()
    def publish(self, channel: str, msg, qos: int):
        if self._client:
            self._client.publish(channel, msg, qos=qos)
    def is_connected(self) -> bool:
        if self._client:
            return self._client.is_connected()
        else:
            return False

class Backend:
    def __init__(self, *, google_bucket_name: str, app_url: str, label: str, admin_user_id: Union[str, None]=None):
        self._google_bucket_name = google_bucket_name
        self._app_url = app_url
        self._label = label
        self._registration: Union[None, dict] = None
        self._registration_timestamp = 0
        self._last_registration_attempt_timestamp = 0
        self._last_report_alive_timestamp = 0
        self._last_update_user_permissions_timestamp = 0
        self._secret: Union[str, None] = None
        self._user_permissions: Dict[str, dict] = {}
        self._admin_user_id = admin_user_id
        self._config_object = None
        def on_ably_message(msg):
            self._on_ably_message(msg)
        self._ably_client = AblyClient(on_ably_message=on_ably_message)
        def on_publish_message(msg):
            if self._registration is None:
                print('WARNING: unable to publish message. Registration is None')
                return
            if not self._ably_client.is_connected():
                print('WARNING: unable to publish message. Ably client is not connected')
                return
            ably_channel = self._registration['serverChannelName']
            self._ably_client.publish(ably_channel, json.dumps(msg).encode('utf-8'), qos=1)
        self._task_manager = TaskManager(on_publish_message=on_publish_message, google_bucket_name=google_bucket_name)
        self._subfeed_manager = SubfeedManager(on_publish_message=on_publish_message, google_bucket_name=google_bucket_name)
    def iterate(self):
        # Check if we need to renew registration
        renew_registration = False
        if (self._registration is None) or (self._registration_age() > 60 * 10):
            renew_registration = True
        elif not self._ably_client.is_connected():
            renew_registration = True
        if renew_registration:
            elapsed_since_last_attempt = time.time() - self._last_registration_attempt_timestamp
            if elapsed_since_last_attempt > 15:
                self._renew_registration()
        
        
        # Check if we need to report alive
        elapsed_since_last_report_alive = min(time.time() - self._last_report_alive_timestamp, time.time() - self._last_report_alive_timestamp)
        if elapsed_since_last_report_alive > 60:
            self._report_alive()

        # update authorized users
        elapsed_since_update_user_permissions = time.time() - self._last_update_user_permissions_timestamp
        if elapsed_since_update_user_permissions > 20:
            self._update_user_permissions()
        
        self._task_manager.iterate()
        self._subfeed_manager.iterate()
    def cleanup(self):
        pass
    
    def _update_user_permissions(self):
        x = kp.get('_sortingview_user_permissions')
        if x is None:
            x = {}
        self._user_permissions = x
        
    def _registration_age(self):
        return time.time() - self._registration_timestamp
    def _on_ably_message(self, message: dict):
        id_token = message.get('idToken', None)
        if id_token is not None:
            id_info = _verify_oauth2_token(cast(str, id_token).encode('utf-8'))
            auth_user_id = id_info['email']
        else:
            auth_user_id = None
        type0 = message.get('type', None)
        if type0 == 'initiateTask':
            # export type TaskQueueMessage = {
            #     type: 'initiateTask'
            #     task: {
            #         functionId: string
            #         kwargs: JSONObject
            #     }
            #     taskHash: Sha1Hash
            # }
            try:
                task_hash = message.get('taskHash')
                task_data = message.get('task')
                function_id = task_data.get('functionId')
                kwargs = task_data.get('kwargs')
            except Exception as e:
                print(e)
                print('Unexpected problem parsing task payload')
                task_hash = None
                task_data = None
                function_id = None
                kwargs = None
            if task_hash is not None and task_data is not None and function_id is not None and kwargs is not None:
                # todo: verify the task hash here
                td = find_taskfunction(function_id)
                if td is not None:
                    try:
                        taskjob = td(**kwargs)
                        self._task_manager.add_task(task_hash, task_data, taskjob)
                    except Exception as e:
                        msg = {'type': 'taskStatusUpdate', 'taskHash': task_hash, 'status': 'error', 'error': f'Unable to create job: {str(e)}'}
                        self._publish_to_task_status(msg)
                else:
                    msg = {'type': 'taskStatusUpdate', 'taskHash': task_hash, 'status': 'error', 'error': f'Unable to find task function: {function_id}'}
                    self._ably_client.publish(self._registration['serverChannelName'], json.dumps(msg).encode('utf-8'), qos=1)
        elif type0 == 'subscribeToSubfeed':
            feed_id = message.get('feedId', None)
            subfeed_hash = message.get('subfeedHash', None)
            if feed_id is not None and subfeed_hash is not None:
                self._subfeed_manager.subscribe_to_subfeed(feed_id=feed_id, subfeed_hash=subfeed_hash)
        elif type0 == 'appendMessagesToSubfeed':
            feed_id = message.get('feedId', None)
            subfeed_hash = message.get('subfeedHash', None)
            messages = message.get('messages', None)
            if feed_id is None: return
            if subfeed_hash is None: return
            if messages is None: return
            if not self._user_can_append_to_subfeed(auth_user_id, feed_id, subfeed_hash):
                return
            sf = kp.load_subfeed(f'feed://{feed_id}/~{subfeed_hash}')
            sf.append_messages(messages)
            # self._subfeed_manager.check_for_new_messages() # to this so we get a quick update response for the subscribing clients (including the submitter)
        elif type0 == 'probe':
            self._report_alive()
        elif type0 == 'getUserPermissions':
            user_id = message.get('userId', None)
            if user_id is None: return
            if not self._user_can_get_user_permissions(auth_user_id, user_id):
                return
            perm = self._get_user_permissions(user_id)
            msg = {
                'type': 'userPermissions',
                'userId': user_id,
                'permissions': perm
            }
            self._ably_client.publish(self._registration['serverChannelName'], json.dumps(msg).encode('utf-8'), qos=1)
        elif type0 == 'getBackendInfo':
            msg = {
                'type': 'backendInfo',
                'pythonProjectVersion': __version__
            }
            self._ably_client.publish(self._registration['serverChannelName'], json.dumps(msg).encode('utf-8'), qos=1)
    def _report_alive(self):
        if self._ably_client is None:
            return
        self._last_report_alive_timestamp = time.time()
        msg = {
            'type': 'reportAlive',
        }
        if self._registration is not None:
            self._ably_client.publish(self._registration['serverChannelName'], json.dumps(msg).encode('utf-8'), qos=1)
        self._upload_config_object_to_google_cloud()
    def _publish_to_task_status(self, msg: dict):
        self._ably_client.publish(self._registration['serverChannelName'], json.dumps(msg).encode('utf-8'), qos=1)
    def _config_object_name(self):
        return f'sortingview-backends/{self._label}.json'
    def _upload_config_object_to_google_cloud(self):
        self._config_object['timestamp'] = time.time()
        _upload_to_google_cloud(self._google_bucket_name, self._config_object_name(), json.dumps(self._config_object).encode('utf-8'))
    def _renew_registration(self):
        self._last_registration_attempt_timestamp = time.time()
        google_bucket_base_url = f'https://storage.googleapis.com/{self._google_bucket_name}'
        
        self._secret = _random_id()
        self._config_object = {
            'label': self._label,
            'objectStorageUrl': google_bucket_base_url,
            'secretSha1': _sha1_of_string(self._secret),
            'timestamp': 0 # filled in at upload
        }
        self._upload_config_object_to_google_cloud()


        # export type RegisterRequest = {
        #     type: 'registerBackendProvider' | 'registerClient'
        #     appName: 'sortingview',
        #     backendProviderUri: string
        #     secret?: string
        # }
        registration = _http_json_post(f'{self._app_url}/api/register', {
            'type': 'registerBackendProvider',
            'appName': 'sortingview',
            'backendProviderUri': f'gs://{self._google_bucket_name}/{self._config_object_name()}',
            'secret': self._secret
        })

        print(f'')
        print(f'==========================================================================================')
        print(f'Backend URI: gs://{self._google_bucket_name}/{self._config_object_name}')
        print(f'')
        client_channel_name = registration['clientChannelName']
        server_channel_name = registration['serverChannelName']
        token_details = registration['tokenDetails']

        self._registration = registration
        self._registration_timestamp = time.time()

        self._ably_client.reconnect(client_channel_name=client_channel_name, token_details=token_details)
        

    def _user_can_append_to_subfeed(self, auth_user_id: Union[str, None], feed_id: str, subfeed_hash: str):
        if auth_user_id is None: return False
        perm = self._get_user_permissions(auth_user_id)
        if perm.get('appendToAllFeeds', False): return True
        f = perm.get('feeds', {})
        if feed_id in f:
            if f[feed_id].get('append', False): return True
        return False
    def _get_user_permissions(self, user_id: str) -> dict:
        return self._user_permissions.get(user_id, {})
    def _user_can_get_user_permissions(self, auth_user_id: Union[str, None], user_id: str):
        if auth_user_id is None: return False
        if auth_user_id == user_id: return True
        if self._user_is_admin(auth_user_id): return True
        return False
    def _user_is_admin(self, user_id: str):
        p = self._get_user_permissions(user_id)
        if p.get('admin', False): return True
        if (self._admin_user_id is not None) and (user_id == self._admin_user_id): return True
        return False

def _random_id():
    return str(uuid.uuid4())[-12:]

def _sha1_of_string(x: str):
    return hashlib.sha1(x.encode('utf-8')).hexdigest()