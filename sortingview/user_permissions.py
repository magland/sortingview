from typing import Union
import kachery_client as kc

key = '_sortingview_user_permissions'

def set_user_permissions(user_id: str, *, append_to_all_feeds: Union[None, bool]=None):
    p = kc.get(key, {})
    p_user = p.get(user_id, {})
    if append_to_all_feeds is not None:
        p_user['appendToAllFeeds'] = append_to_all_feeds
    p[user_id] = p_user
    kc.set(key, p)

def set_user_feed_permissions(user_id: str, *, feed_id: str, append: Union[None, bool]=None):
    p = kc.get(key)
    if p is None: p = {}
    p_user = p.get(user_id, {})
    feeds = p_user.get('feeds', {})
    feed = feeds.get(feed_id, {})
    if append is not None:
        feed['append'] = append
    feeds[feed_id] = feed
    p_user['feeds'] = feeds
    p[user_id] = p_user
    kc.set(key, p)

def get_user_permissions_dict(user_id: str):
    p = kc.get(key)
    if p is None: p = {}
    p_user = p.get(user_id, {})
    return p_user