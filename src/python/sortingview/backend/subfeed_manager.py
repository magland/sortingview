import json
import time
from typing import Any, Callable, Dict, List
import kachery_p2p as kp
import multiprocessing
from multiprocessing.connection import Connection
from .task_manager import _pathify_hash
from ._common import _upload_to_google_cloud

class Subfeed:
    def __init__(self, *, on_publish_message: Callable, google_bucket_name: str, feed_id: str, subfeed_hash: str):
        self._on_publish_message = on_publish_message
        self._google_bucket_name = google_bucket_name
        self._feed_id = feed_id
        self._subfeed_hash = subfeed_hash
        self._num_messages_reported = 0
    @property
    def feed_id(self):
        return self._feed_id
    @property
    def subfeed_hash(self):
        return self._subfeed_hash
    @property
    def num_messages_reported(self):
        return self._num_messages_reported
    def report_new_messages(self, position: int, messages: List[Any]):
        if len(messages) == 0:
            return
        for i in range(len(messages)):
            message_num = position + i
            object_name = f'feeds/{_pathify_hash(self._feed_id)}/subfeeds/{_pathify_hash(self._subfeed_hash)}/{message_num}'
            _upload_to_google_cloud(self._google_bucket_name, object_name, json.dumps(messages[i]).encode('utf-8'), replace=False)
        
        message_count = position + len(messages)
        subfeed_json = {
            'messageCount': message_count
        }
        p = f'feeds/{_pathify_hash(self._feed_id)}/subfeeds/{_pathify_hash(self._subfeed_hash)}/subfeed.json'
        _upload_to_google_cloud(self._google_bucket_name, p, json.dumps(subfeed_json).encode('utf-8'), replace=True)

        msg = {'type': 'subfeedUpdate', 'feedId': self._feed_id, 'subfeedHash': self._subfeed_hash, 'messageCount': message_count}
        self._on_publish_message(msg)
        self._num_messages_reported = position + len(messages)

class SubfeedManager:
    def __init__(self, *, on_publish_message: Callable, google_bucket_name: str):
        self._subfeeds: Dict[str, Subfeed] = {}
        self._on_publish_message = on_publish_message
        self._google_bucket_name = google_bucket_name
        # self._last_watch_timestamp = 0


        pipe_to_parent, pipe_to_child = multiprocessing.Pipe()
        self._worker_process =  multiprocessing.Process(target=_run_worker, args=(pipe_to_parent,))
        self._worker_process.start()
        self._pipe_to_worker = pipe_to_child
        self._waiting_for_worker_response = False

    def subscribe_to_subfeed(self, *, feed_id: str, subfeed_hash: str):
        code = self._get_code(feed_id, subfeed_hash)
        if code in self._subfeeds:
            return
        self._subfeeds[code] = Subfeed(on_publish_message=self._on_publish_message, google_bucket_name=self._google_bucket_name, feed_id=feed_id, subfeed_hash=subfeed_hash)
        
        # ret = kp.watch_for_new_messages(subfeed_watches, wait_msec=100, signed=True)
        # for k, v in self._subfeeds.items():
        #     if k in ret:
        #         new_messages = ret[k]
        #         v.report_new_messages(subfeed_watches[k]['position'], new_messages)
        # self._last_watch_timestamp = time.time()
        
    def iterate(self):
        if not self._waiting_for_worker_response:
            subfeed_watches = {}
            codes = list(self._subfeeds.keys())
            for k in codes:
                v = self._subfeeds[k]
                subfeed_watches[k] = {
                    'feedId': v.feed_id,
                    'subfeedHash': v.subfeed_hash,
                    'position': v.num_messages_reported
                }
            if bool(subfeed_watches):
                self._pipe_to_worker.send(subfeed_watches)
                self._waiting_for_worker_response = True
        else:
            if self._pipe_to_worker.poll():
                msg = self._pipe_to_worker.recv()
                subfeed_watches = msg['subfeed_watches']
                new_messages = msg['new_messages']
                codes = list(self._subfeeds.keys())
                for k in codes:
                    v = self._subfeeds[k]
                    if k in new_messages:
                        if len(new_messages[k]) > 0:
                            v.report_new_messages(subfeed_watches[k]['position'], new_messages[k])
                self._waiting_for_worker_response = False

    def _get_code(self, feed_id: str, subfeed_hash: str):
        return feed_id + ':' + subfeed_hash

def _run_worker(pipe_to_parent: Connection):
    while True:
        while pipe_to_parent.poll():
            x = pipe_to_parent.recv()
            if isinstance(x, str):
                if x == 'exit':
                    return
                else:
                    print(x)
                    raise Exception('Unexpected message in _run_worker')
            elif isinstance(x, dict):
                subfeed_watches = x
                try:
                    ret = kp.watch_for_new_messages(subfeed_watches, wait_msec=6000, signed=True)
                except Exception as e:
                    print('WARNING: problem watching for new messages', e)
                    ret = {}
                pipe_to_parent.send({'subfeed_watches': subfeed_watches, 'new_messages': ret})
            else:
                print(x)
                raise Exception('Unexpected message in _run_worker')    
        time.sleep(0.1)

    