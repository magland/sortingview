import kachery_cloud as kcl
from typing import Any
from ._get_sorting_curation import _simplify_merge_groups


def parse_old_workspace_uri(workspace_uri: str):
    if not workspace_uri.startswith('workspace://'):
        raise Exception(f'Invalid workspace uri: {workspace_uri}')
    if '?' not in workspace_uri:
        workspace_uri = workspace_uri + '?'
    params = {}
    ind = workspace_uri.index('?')
    feed_id = workspace_uri[:ind].split('/')[2]
    query_string = workspace_uri[ind+1:]
    return feed_id, query_string

def get_messages_from_old_workspace(feed_id: str):
    import kachery_client as kc
    feed = kc.load_feed(f'feed://{feed_id}')
    main_subfeed = feed.load_subfeed('main')
    messages = []
    while True:
        message = main_subfeed.get_next_message(wait_msec=10)
        if message is not None:
            messages.append(message)
        else:
            break
    return messages

def get_sorting_curation_for_old_workspace(feed_id: str, sorting_id: str):
    import kachery_client as kc
    feed = kc.load_feed(f'feed://{feed_id}')
    curation_subfeed = feed.load_subfeed(dict(name='sortingCuration', sortingId=sorting_id))
    return _get_sorting_curation_for_old_workspace_helper(curation_subfeed)

def _get_sorting_curation_for_old_workspace_helper(subfeed):
    subfeed.set_position(0)
    labels_by_unit = {}
    merge_groups = []
    is_closed = False
    while True:
        msgs = subfeed.get_next_messages(wait_msec=0)
        if msgs is None: break
        if len(msgs) == 0: break
        for a in msgs:
            message_type = a.get('type', None)
            assert message_type is not None, "Feed contained message with no type."
            # if is_closed and message_type != 'REOPEN_CURATION':
            #    raise Exception('ERROR: Subfeed attempts curation on a closed curation object.')
            if message_type == 'ADD_UNIT_LABEL':
                unit_ids = a.get('unitId', []) # allow this to be a list or an int
                if not isinstance(unit_ids, list):
                    unit_ids = [unit_ids]
                label = a.get('label', []) # allow this to be a list or an int
                for unit_id in unit_ids:
                    if unit_id not in labels_by_unit:
                        labels_by_unit[unit_id] = []
                    labels_by_unit[unit_id].append(label)
                    labels_by_unit[unit_id] = sorted(list(set(labels_by_unit[unit_id])))
            elif message_type == 'REMOVE_UNIT_LABEL':
                unit_ids = a.get('unitId', '')
                if not isinstance(unit_ids, list):
                    unit_ids = [unit_ids]
                label = a.get('label', '')
                for unit_id in unit_ids:
                    if unit_id in labels_by_unit:
                        labels_by_unit[unit_id] = [x for x in labels_by_unit[unit_id] if x != label]
            elif message_type == 'MERGE_UNITS':
                unit_ids = a.get('unitIds', [])
                merge_groups = _simplify_merge_groups(merge_groups + [unit_ids])
            elif message_type == 'UNMERGE_UNITS':
                unit_ids = a.get('unitIds', [])
                merge_groups = _simplify_merge_groups([[u for u in mg if (u not in unit_ids)] for mg in merge_groups])
            elif message_type == 'CLOSE_CURATION':
                is_closed = True
            elif message_type == 'REOPEN_CURATION':
                is_closed = False
    return {
        'labelsByUnit': labels_by_unit,
        'mergeGroups': merge_groups,
        'isClosed': is_closed
    }

def _migrate_files_from_old_kachery_recursive(x: Any):
    if isinstance(x, dict):
        y = {}
        for k in x.keys():
            y[k] = _migrate_files_from_old_kachery_recursive(x[k])
        return y
    elif isinstance(x, list):
        return [_migrate_files_from_old_kachery_recursive(a) for a in x]
    elif isinstance(x, str) and x.startswith('sha1://'):
        return _migrate_file_from_old_kachery(x)
    else:
        return x

def _migrate_file_from_old_kachery(uri: str):
    import kachery_client as kc
    if not uri.startswith('sha1://'):
        return uri
    path = kcl.load_file(uri)
    if path is not None:
        return uri
    path2 = kc.load_file(uri)
    if path2 is None:
        raise Exception(f'Unable to migrate file from old kachery: {uri}')
    return kcl.store_file_local(path2, reference=True, label=None)
