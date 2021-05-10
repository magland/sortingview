import time
import json
import uuid
import hashlib
from typing import List, Union, cast
import kachery_p2p as kp
from ._verify_oauth2_token import _verify_oauth2_token

from .subfeed_manager import SubfeedManager

from .task_manager import TaskManager
from .taskfunction import find_taskfunction
from ._common import _http_json_post, _upload_to_google_cloud
import paho.mqtt.client as mqtt

class Backend:
    def __init__(self, *, google_bucket_name: str, app_url: str, label: str):
        self._google_bucket_name = google_bucket_name
        self._app_url = app_url
        self._label = label
        self._registration: Union[None, dict] = None
        self._registration_timestamp = 0
        self._last_registration_attempt_timestamp = 0
        self._last_report_alive_timestamp = 0
        self._last_update_authorized_users_timestamp = 0
        self._ably_client: Union[mqtt.Client, None] = None
        self._secret: Union[str, None] = None
        self._authorized_users: List[str] = []
        def on_publish_message(msg):
            if self._registration is None:
                print('WARNING: unable to publish message. Registration is None')
                return
            if self._ably_client is None:
                print('WARNING: unable to publish message. Ably client is None')
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
        elif (self._ably_client is not None) and (not self._ably_client.is_connected()):
            renew_registration = True
        if renew_registration:
            elapsed_since_last_attempt = time.time() - self._last_registration_attempt_timestamp
            if elapsed_since_last_attempt > 15:
                self._renew_registration()
        
        # Check if we need to report alive
        elapsed_since_last_report = min(time.time() - self._last_report_alive_timestamp, time.time() - self._last_report_alive_timestamp)
        if elapsed_since_last_report > 60:
            self._renew_registration(report_only=True)

        # update authorized users
        elapsed_since_update_authorized_users = time.time() - self._last_update_authorized_users_timestamp
        if elapsed_since_update_authorized_users > 20:
            self._update_authorized_users()
        
        self._task_manager.iterate()
        self._subfeed_manager.iterate()
    def cleanup(self):
        self._renew_registration(report_only=True, unregister=True)
    
    def _update_authorized_users(self):
        x = kp.get('_sortingview_authorized_users')
        if x is None:
            x = []
        self._authorized_users = x
        
    def _registration_age(self):
        return time.time() - self._registration_timestamp
    def _on_ably_message(self, message: dict):
        id_token = message.get('idToken', None)
        if id_token is not None:
            id_info = _verify_oauth2_token(cast(str, id_token).encode('utf-8'))
            user_email = id_info['email']
        else:
            user_email = None
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
            if not self._user_can_append_to_subfeed(user_email, feed_id, subfeed_hash):
                return
            sf = kp.load_subfeed(f'feed://{feed_id}/~{subfeed_hash}')
            sf.append_messages(messages)
            self._subfeed_manager.check_for_new_messages() # to this so we get a quick update response for the subscribing clients (including the submitter)
        elif type0 == 'probeBackendProviders':
            app_name = message.get('appName', None)
            if app_name != 'sortingview':
                return
            self._renew_registration(report_only=True, unregister=False)
    def _publish_to_task_status(self, msg: dict):
        self._ably_client.publish(self._registration['serverChannelName'], json.dumps(msg).encode('utf-8'), qos=1)
    def _renew_registration(self, report_only=False, unregister=False):
        if not report_only:
            self._last_registration_attempt_timestamp = time.time()
        else:
            self._last_report_alive_timestamp = time.time()
        google_bucket_base_url = f'https://storage.googleapis.com/{self._google_bucket_name}'
        config_object_name = f'sortingview-backends/{self._label}.json'
        if not report_only:
            self._secret = _random_id()
            config = {
                'label': self._label,
                'objectStorageUrl': google_bucket_base_url,
                'secretSha1': _sha1_of_string(self._secret)
            }
            _upload_to_google_cloud(self._google_bucket_name, config_object_name, json.dumps(config).encode('utf-8'))


        # export type RegisterRequest = {
        #     type: 'registerBackendProvider' | 'unregisterBackendProvider' | 'registerClient'
        #     appName: 'sortingview',
        #     backendProviderUri: string
        #     secret?: string
        #     reportOnly?: string
        # }
        registration = _http_json_post(f'{self._app_url}/api/register', {
            'type': 'registerBackendProvider' if not unregister else 'unregisterBackendProvider',
            'appName': 'sortingview',
            'backendProviderUri': f'gs://{self._google_bucket_name}/{config_object_name}',
            'secret': self._secret,
            'reportOnly': report_only
        })

        print(f'')
        print(f'==========================================================================================')
        print(f'Compute engine URI: gs://{self._google_bucket_name}/{config_object_name}')
        print(f'')
        if not report_only:
            client_channel_name = registration['clientChannelName']
            server_channel_name = registration['serverChannelName']
            token_details = registration['tokenDetails']
            ably_client = mqtt.Client()
            ably_client.username_pw_set(token_details['token'], '')
            ably_client.tls_set()
            def on_connect(client, userdata, flags, rc):
                old_ably_client = self._ably_client
                self._ably_client = ably_client
                if old_ably_client is not None:
                    old_ably_client.disconnect()
                ably_client.subscribe(client_channel_name)
                ably_client.subscribe('probe')
                print('Ably client connected')
            def on_disconnect(client, userdata, rc):
                print('Ably client disconnected')
                ably_client.loop_stop()
            def on_message(client0, userdata, message: mqtt.MQTTMessage):
                self._on_ably_message(json.loads(message.payload.decode('utf-8')))
            ably_client.on_connect = on_connect
            ably_client.on_disconnect = on_disconnect
            ably_client.on_message = on_message
            ably_client.connect('mqtt.ably.io', port=8883, keepalive=15)
            ably_client.loop_start()
            self._registration = registration
            self._registration_timestamp = time.time()

    def _user_can_append_to_subfeed(self, user_email: Union[str, None], feed_id: str, subfeed_hash: str):
        return user_email in self._authorized_users

def _random_id():
    return str(uuid.uuid4())[-12:]

def _sha1_of_string(x: str):
    return hashlib.sha1(x.encode('utf-8')).hexdigest()