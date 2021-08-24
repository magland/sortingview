from typing import Any
import kachery_client as kc

# @kc.taskfunction('latency_test_query.1', type='query')
def task_latency_test_query(x: str):
    return x

# @kc.taskfunction('get_action_latency_test_subfeed.1', type='query')
def get_action_latency_test_subfeed():
    feed = kc.load_feed('_latency_test', create=True)
    subfeed = feed.load_subfeed('main')
    return {
        'feedId': feed.feed_id,
        'subfeedHash': subfeed.subfeed_hash
    }

# @kc.taskfunction('subfeed_latency_test_append.1', type='query')
def subfeed_latency_test_append(message: Any):
    feed = kc.load_feed('_latency_test')
    subfeed = feed.load_subfeed('main')
    subfeed.append_message(message)
    return {'numMessages': subfeed.get_num_local_messages()}