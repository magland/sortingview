import json
from typing import Any, Dict, List, Tuple, Union
import uuid
import kachery_client as kc

from sortingview.experimental.SpikeSortingView.SpikeSortingView import SpikeSortingView
from ..extractors import LabboxEphysRecordingExtractor, LabboxEphysSortingExtractor

def parse_workspace_uri(workspace_uri: str):
    if not workspace_uri.startswith('workspace://'):
        raise Exception(f'Invalid workspace uri: {workspace_uri}')
    if '?' not in workspace_uri:
        workspace_uri = workspace_uri + '?'
    params = {}
    ind = workspace_uri.index('?')
    feed_id = workspace_uri[:ind].split('/')[2]
    query_string = workspace_uri[ind+1:]
    return feed_id, query_string

class Workspace:
    def __init__(self, *, workspace_uri: str, label: Union[None, str]=None) -> None:
        feed_id, query_string = parse_workspace_uri(workspace_uri)
        self._query_string = query_string
        self._feed = kc.load_feed(f'feed://{feed_id}')
        main_subfeed = self._feed.load_subfeed('main')
        messages = _get_messages_from_subfeed(main_subfeed)
        self._recordings = _get_recordings_from_subfeed_messages(messages)
        self._sortings = _get_sortings_from_subfeed_messages(messages)
        self._unit_metrics_for_sortings = _get_unit_metrics_for_sortings_from_subfeed_messages(messages)
        self._user_permissions = _get_user_permissions_from_subfeed_messages(messages)
        self._snippet_len: Tuple[int, int] = _get_snippet_len_from_subfeed_messages(messages)
        self._label = label
    @property
    def uri(self):
        q = f'?{self._query_string}' if self._query_string else ''
        return f'workspace://{self._feed.feed_id}{q}'
    @property
    def feed_uri(self):
        return self._feed.uri
    @property
    def feed_id(self):
        return self._feed.feed_id
    @property
    def feed(self):
        return self._feed
    @property
    def label(self):
        if self._label is not None:
            return self._label
        p = _query_string_to_dict(self._query_string)
        return p.get('label', '')
    def get_uri(self):
        print('WARNING: workspace.get_uri() is deprecated. Use workspace.uri instead')
        return self.uri
    def get_feed_id(self):
        print('WARNING: workspace.feed_id is deprecated. Use workspace.feed_id instead')
        return self.feed_id
    def set_label(self, label: str):
        p = _query_string_to_dict(self._query_string)
        if label:
            p['label'] = label
        else:
            if 'label' in p:
                del p['label']
        self._query_string = _dict_to_query_string(p)
    def add_recording(self, *, label: str, recording: LabboxEphysRecordingExtractor):
        recording_id = 'R-' + _random_id()
        if recording_id in self._recordings:
            raise Exception(f'Duplicate recording ID: {recording_id}')
        x = {
            'recordingId': recording_id,
            'recordingLabel': label,
            'recordingPath': kc.store_json(recording.object(), basename=f'{label}.json'),
            'recordingObject': recording.object(),
            'description': f'Imported from Python: {label}'
        }
        main_subfeed = self._feed.load_subfeed('main')
        _import_le_recording(main_subfeed, x)
        self._recordings[recording_id] = x
        return recording_id
    def add_sorting(self, *, recording_id: str, label: str, sorting: LabboxEphysSortingExtractor):
        sorting_id = 'S-' + _random_id()
        if recording_id not in self._recordings:
            raise Exception(f'Recording not found: {recording_id}')
        if sorting_id in self._sortings:
            raise Exception(f'Duplicate sorting ID: {sorting_id}')
        le_recording = self._recordings[recording_id]
        x = {
            'sortingId': sorting_id,
            'sortingLabel': label,
            'sortingPath': kc.store_json(sorting.object(), basename=f'{label}.json'),
            'sortingObject': sorting.object(),

            'recordingId': recording_id,
            'recordingPath': le_recording['recordingPath'],
            'recordingObject': le_recording['recordingObject'],

            'description': f'Imported from Python: {label}'
        }
        main_subfeed = self._feed.load_subfeed('main')
        _import_le_sorting(main_subfeed, x)
        self._sortings[sorting_id] = x
        return sorting_id
    def precalculate(self):
        from ._precalculate import _precalculate
        _precalculate(self)
    def _precalculate_debug(self):
        from ._precalculate import _precalculate_debug
        _precalculate_debug(self)
    def _append_action(self, action: dict):
        main_subfeed = self._feed.load_subfeed('main')
        main_subfeed.append_message({
            'action': action
        })
    def set_unit_metrics_for_sorting(self, *, sorting_id: str, metrics: List[dict]):
        metrics_uri = kc.store_json(metrics, basename='unit_metrics.json')
        x = {
            'sortingId': sorting_id,
            'metricsUri': metrics_uri
        }
        main_subfeed = self._feed.load_subfeed('main')
        _set_unit_metrics_for_sorting(main_subfeed, x)
        self._unit_metrics_for_sortings[sorting_id] = metrics
    def get_unit_metrics_for_sorting(self, sorting_id: str):
        return self._unit_metrics_for_sortings.get(sorting_id, [])
    def delete_recording(self, recording_id: str):
        if recording_id not in self._recordings:
            raise Exception(f'Recording not found: {recording_id}')
        _delete_recording(feed=self._feed, recording_id=recording_id)
        del self._recordings[recording_id]
    def delete_sorting(self, sorting_id: str):
        if sorting_id not in self._sortings:
            raise Exception(f'Sorting not found: {sorting_id}')
        _delete_sorting(feed=self._feed, sorting_id=sorting_id)
        del self._sortings[sorting_id]
    def set_user_permissions(self, user_id: str, permissions: dict):
        if json.dumps(permissions) == json.dumps(self._user_permissions.get(user_id, {})):
            return
        main_subfeed = self._feed.load_subfeed('main')
        _set_user_permissions_for_workspace(main_subfeed, user_id, permissions)
        self._user_permissions[user_id] = permissions
    def set_sorting_curation_authorized_users(self, *, sorting_id: str, user_ids):
        sorting_curation_uri = self.get_curation_subfeed(sorting_id).uri
        SpikeSortingView.set_sorting_curation_authorized_users(sorting_curation_uri, user_ids)
    def get_sorting_curation_authorized_users(self, *, sorting_id: str):
        sorting_curation_uri = self.get_curation_subfeed(sorting_id).uri
        return SpikeSortingView.get_sorting_curation_authorized_users(sorting_curation_uri)
    def set_snippet_len(self, snippet_len: Tuple[int, int]):
        main_subfeed = self._feed.load_subfeed('main')
        _set_snippet_len_for_workspace(main_subfeed, snippet_len)
        self._snippet_len = snippet_len
    def figurl(self):
        from figurl import Figure
        data = {
            'type': 'workspace',
            'workspaceUri': self.uri
        }
        return Figure(view_url='gs://figurl/sortingview-gui-1', data=data)
    @property
    def snippet_len(self):
        return self._snippet_len
    def get_user_permissions(self, user_id: str) -> Union[None, dict]:
        return self._user_permissions.get(user_id, None)
    def get_all_users(self) -> List[str]:
        return list(self._user_permissions.keys())
    def get_recording(self, recording_id: str):
        return self._recordings[recording_id]
    def get_sorting(self, sorting_id: str):
        return self._sortings[sorting_id]
    @property
    def recording_ids(self):
        return list(self._recordings.keys())
    @property
    def sorting_ids(self):
        return list(self._sortings.keys())
    def get_sorting_ids_for_recording(self, recording_id: str):
        return [sid for sid in self.sorting_ids if self.get_sorting(sid)['recordingId'] == recording_id]
    def get_recording_extractor(self, recording_id):
        r = self.get_recording(recording_id)
        return LabboxEphysRecordingExtractor(r['recordingObject'])
    def get_sorting_extractor(self, sorting_id):
        s = self.get_sorting(sorting_id)
        return LabboxEphysSortingExtractor(s['sortingObject'])
    def get_curation_subfeed(self, sorting_id: str) -> kc.Subfeed:
        return self._feed.load_subfeed(dict(name='sortingCuration', sortingId=sorting_id))
    def get_sorting_curation(self, sorting_id: str):
        curation_subfeed = self.get_curation_subfeed(sorting_id)
        return _get_sorting_curation(curation_subfeed, sorting_id=sorting_id)
    def get_sorting_curation_uri(self, sorting_id: str):
        curation_subfeed = self.get_curation_subfeed(sorting_id)
        return curation_subfeed.uri
    def get_curated_sorting_extractor(self, sorting_id):
        s = self.get_sorting(sorting_id)
        sc = self.get_sorting_curation(sorting_id)
        return LabboxEphysSortingExtractor({
            'sorting_format': 'curated',
            'data': {
                'sorting': s['sortingObject'],
                'merge_groups': sc.get('mergeGroups', [])
            }
        })
    def sorting_curation_add_label(self, *, sorting_id, label: str, unit_ids: Union[int, List[int]]):
        action = {
            'type': 'ADD_UNIT_LABEL',
            'label': label,
            'unitId': unit_ids
        }
        self.add_sorting_curation_action(sorting_id, action)
    def sorting_curation_remove_label(self, *, sorting_id, label: str, unit_ids: Union[int, List[int]]):
        action = {
            'type': 'REMOVE_UNIT_LABEL',
            'label': label,
            'unitId': unit_ids
        }
        self.add_sorting_curation_action(sorting_id, action)
    def sorting_curation_merge_units(self, *, sorting_id, unit_ids: Union[int, List[int]]):
        action = {
            'type': 'MERGE_UNITS',
            'unitIds': unit_ids
        }
        self.add_sorting_curation_action(sorting_id, action)
    def sorting_curation_unmerge_units(self, *, sorting_id, unit_ids: Union[int, List[int]]):
        action = {
            'type': 'UNMERGE_UNITS',
            'unitIds': unit_ids
        }
        self.add_sorting_curation_action(sorting_id, action)
    def add_sorting_curation_action(self, sorting_id: str, action: dict):
        sorting = self.get_sorting_extractor(sorting_id)
        valid_unit_ids = sorting.get_unit_ids()
        action_type = action['type']
        valid_labeling_actions = ['ADD_UNIT_LABEL',
                                    'REMOVE_UNIT_LABEL']
        valid_unit_based_actions = ['MERGE_UNITS', 'UNMERGE_UNITS']
        valid_unitless_actions = ['CLOSE_CURATION', 'REOPEN_CURATION']
        valid_labels = ['accept', 'reject', 'noise', 'artifact', 'mua']
        missing_label = False
        # Flag for action's dependence on unitId existence
        unitId_req = None
        if action_type in valid_labeling_actions:
            unitId_req = True
            unitIds_req = False
            # Check for valid label in action message
            if 'label' in action:
                if action['label'] is not None:
                    label = action['label']
                    if label in valid_labels:
                        pass
                    else:
                        raise ValueError(f'Invalid label: {label}')
            else:
                raise RuntimeError(f'No label provided; Action type: {action_type} requires a label')
        elif action_type in valid_unit_based_actions:
            unitId_req = False
            unitIds_req = True
            if 'label' in action: 
                raise ValueError(f'label is invalid argument for action type: {action_type}')
        elif action_type in valid_unitless_actions:
            unitId_req = False
            unitIds_req = False
            if 'label' in action: 
                raise ValueError(f'label is invalid argument for action type: {action_type}')
        else:
            raise RuntimeError(f'Invalid curation action type: {action_type}')
        # Check if unitId is list or int
        if unitId_req == True:
            unit_ids = action['unitId']
            if not isinstance(unit_ids, list):
                if not isinstance(unit_ids, int):
                    raise ValueError(f'Invalid unitId: {unit_ids}, type: {type(unit_ids)}')
                else:
                    unit_ids = [unit_ids]
            # Check if unitId is valid for the sorting
            invalid_unit_list = [unit for unit in unit_ids if unit not in valid_unit_ids]
            if invalid_unit_list:
                raise ValueError(f'unitId(s): {invalid_unit_list} are not valid unitIds for this sorting')
            # Check if label has already been added to all units
            if action_type == 'ADD_UNIT_LABEL':
                # Get previously added unit labels
                sc = self.get_sorting_curation(sorting_id)
                for unit in unit_ids:
                    if (unit in sc['labelsByUnit']) and (action['label'] not in sc['labelsByUnit'][unit]):
                        missing_label = True
                        break
                    elif unit not in sc['labelsByUnit']:
                        missing_label = True
                        break          
        else:
            # Check if unitId was passed improperly
            if 'unitId' in action:
                if action['unitId'] is not None:
                    raise ValueError(f'unitId is invalid argument for action type: {action_type}')
        if unitIds_req == True:
            unit_ids = action['unitIds']
            if not isinstance(unit_ids, list):
                raise ValueError(f'Invalid unitIds: {unit_ids}, type: {type(unit_ids)}, action type: {action_type} expects list')
            # Check if unitId is valid for the sorting
            invalid_unit_list = [unit for unit in unit_ids if unit not in valid_unit_ids]
            if invalid_unit_list:
                raise ValueError(f'unitIds: {invalid_unit_list} are not valid unitIds for this sorting')
        else:
            # Check if unitId was passed improperly
            if 'unitIds' in action:
                if action['unitIds'] is not None:
                    raise ValueError(f'unitIds is invalid argument for action type: {action_type}')
        if (missing_label == True) or (action_type != 'ADD_UNIT_LABEL'):
            # Load the feed for the curation
            sf = self.get_curation_subfeed(sorting_id)
            # Append the action to the feed
            sf.append_message(action)
        else:
            print(f"Label: '{action['label']}' already appended with action type: {action_type} to all unitIds in action")
    from ._experimental_spikesortingview import experimental_spikesortingview

def create_workspace(*, label: Union[str, None]=None):
    feed = kc.create_feed()
    feed_id = feed.feed_id
    workspace_uri = f'workspace://{feed_id}'
    W = load_workspace(workspace_uri)
    if label:
        W.set_label(label)
    return W

def load_workspace(workspace_uri: Union[str, Any]):
    if not isinstance(workspace_uri, str):
        raise Exception('Invalid workspace URI')
    return Workspace(workspace_uri=workspace_uri)

def _random_id():
    return str(uuid.uuid4())[-12:]

def _get_messages_from_subfeed(subfeed: kc.Subfeed):
    subfeed.set_position(0)
    messages: List[Any] = []
    while True:
        msgs = subfeed.get_next_messages(wait_msec=0)
        if msgs is None: break
        if len(msgs) == 0: break
        for msg in msgs:
            messages.append(msg)
    return messages

def _get_recordings_from_subfeed_messages(messages: List[Any]):
    le_recordings = {}
    for msg in messages:
        if 'action' in msg:
            a = msg['action']
            msg_type = a.get('type', '')
            if msg_type == 'ADD_RECORDING':
                r = a.get('recording', {})
                rid = r.get('recordingId', '')
                le_recordings[rid] = r
            elif msg_type == 'DELETE_RECORDINGS':
                for rid in a.get('recordingIds', []):
                    if rid in le_recordings:
                        del le_recordings[rid]
    return le_recordings

def _get_user_permissions_from_subfeed_messages(messages: List[Any]):
    user_permissions = {}
    for msg in messages:
        if 'action' in msg:
            a = msg['action']
            if a.get('type', '') == 'SET_USER_PERMISSIONS':
                user_id = a.get('userId', None)
                permissions = a.get('permissions', None)
                if user_id and permissions:
                    user_permissions[user_id] = permissions
    return user_permissions

def _set_user_permissions_for_workspace(subfeed: kc.Subfeed, user_id: str, permissions: dict):
    subfeed.append_message({
        'action': {
            'type': 'SET_USER_PERMISSIONS',
            'userId': user_id,
            'permissions': permissions
        }
    })

def _get_snippet_len_from_subfeed_messages(messages: List[Any]):
    snippet_len = (50, 80)
    for msg in messages:
        if 'action' in msg:
            a = msg['action']
            if a.get('type', '') == 'SET_SNIPPET_LEN':
                x = a.get('snippetLen', None)
                if x:
                    snippet_len = x
    return snippet_len

def _set_snippet_len_for_workspace(subfeed: kc.Subfeed, snippet_len: Tuple[int, int]):
    subfeed.append_message({
        'action': {
            'type': 'SET_SNIPPET_LEN',
            'snippetLen': snippet_len
        }
    })

def _get_sortings_from_subfeed_messages(messages: List[Any]):
    le_sortings = {}
    for msg in messages:
        if 'action' in msg:
            a = msg['action']
            msg_type = a.get('type', '')
            if msg_type == 'ADD_SORTING':
                s = a.get('sorting', {})
                sid = s.get('sortingId', '')
                le_sortings[sid] = s
            elif msg_type == 'DELETE_SORTINGS':
                for sid in a.get('sortingIds', []):
                    if sid in le_sortings:
                        del le_sortings[sid]
            elif msg_type == 'DELETE_SORTINGS_FOR_RECORDINGS':
                for rid in a.get('recordingIds', []):
                    sids = list(le_sortings.keys())
                    for sid in sids:
                        if le_sortings[sid]['recordingId'] == rid:
                            del le_sortings[sid]
            elif msg_type == 'DELETE_RECORDINGS':
                for rid in a.get('recordingIds', []):
                    sids = list(le_sortings.keys())
                    for sid in sids:
                        if le_sortings[sid]['recordingId'] == rid:
                            del le_sortings[sid]
    return le_sortings

def _get_unit_metrics_for_sortings_from_subfeed_messages(messages: List[Any]):
    sortings = _get_sortings_from_subfeed_messages(messages)
    le_unit_metrics_for_sortings = {}
    for msg in messages:
        if 'action' in msg:
            a = msg['action']
            if a.get('type', '') == 'SET_UNIT_METRICS_FOR_SORTING':
                x = a.get('unitMetricsForSorting', {})
                sid = x.get('sortingId', '')
                uri = x.get('metricsUri')
                if sid in sortings:
                    le_unit_metrics_for_sortings[sid] = kc.load_json(uri)
    return le_unit_metrics_for_sortings

def _mg_intersection(g1: List[int], g2: List[int]):
    return [x for x in g1 if x in g2]

def _mg_union(g1: List[int], g2: List[int]):
    return sorted(list(set(g1 + g2)))

def _simplify_merge_groups(merge_groups: List[List[int]]):
    new_merge_groups: List[List[int]] = [[x for x in g] for g in merge_groups] # make a copy
    something_changed = True
    while something_changed:
        something_changed = False
        for i in range(len(new_merge_groups)):
            g1 = new_merge_groups[i]
            for j in range(i + 1, len(new_merge_groups)):
                g2 = new_merge_groups[j]
                if len(_mg_intersection(g1, g2)) > 0:
                    new_merge_groups[i] = _mg_union(g1, g2)
                    new_merge_groups[j] = []
                    something_changed = True
    return [sorted(mg) for mg in new_merge_groups if len(mg) >= 2]

def _get_sorting_curation(subfeed: kc.Subfeed, sorting_id: str):
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
    
def _import_le_recording(subfeed: kc.Subfeed, le_recording):
    messages = _get_messages_from_subfeed(subfeed)
    le_recordings = _get_recordings_from_subfeed_messages(messages)
    id = le_recording['recordingId']
    if id in le_recordings:
        print(f'Recording with ID {id} already exists. Not adding.')
        return
    print(f'Adding recording: {id}')
    subfeed.append_message({
        'action': {
            'type': 'ADD_RECORDING',
            'recording': le_recording
        }
    })

def _import_le_sorting(subfeed: kc.Subfeed, le_sorting):
    messages = _get_messages_from_subfeed(subfeed)
    le_sortings = _get_sortings_from_subfeed_messages(messages)
    id = le_sorting["sortingId"]
    if id in le_sortings:
        print(f'Sorting with ID {id} already exists. Not adding.')
        return
    print(f'Adding sorting: {id}')
    subfeed.append_message({
        'action': {
            'type': 'ADD_SORTING',
            'sorting': le_sorting
        }
    })

def _set_unit_metrics_for_sorting(subfeed: kc.Subfeed, le_unit_metrics_for_sorting):
    sid = le_unit_metrics_for_sorting['sortingId']
    print(f'Setting unit metrics for sorting {sid}')
    subfeed.append_message({
        'action': {
            'type': 'SET_UNIT_METRICS_FOR_SORTING',
            'unitMetricsForSorting': le_unit_metrics_for_sorting
        }
    })

def _delete_recording(*, feed: kc.Feed, recording_id: str):
    subfeed = feed.load_subfeed('main')
    messages = _get_messages_from_subfeed(subfeed)
    le_recordings = _get_recordings_from_subfeed_messages(messages)
    if recording_id not in le_recordings:
        print(f'Cannot remove recording. Recording not found: {recording_id}')
    subfeed.append_message({
        'action': {
            'type': 'DELETE_RECORDINGS',
            'recordingIds': [recording_id]
        }
    })
    le_sortings = _get_sortings_from_subfeed_messages(messages)
    sorting_ids_to_delete = []
    for k, v in le_sortings.items():
        if v.get('recordingId') == recording_id:
            sorting_ids_to_delete.append(v.get('sortingId'))
    if len(sorting_ids_to_delete) > 0:
        subfeed.append_message({
            'action': {
                'type': 'DELETE_SORTINGS',
                'sortingIds': sorting_ids_to_delete
            }
        })

def _query_string_to_dict(q: str):
    ret: Dict[str, str] = {}
    for pstr in q.split('&'):
        vals = pstr.split('=')
        if len(vals) == 2:
            ret[vals[0]] = vals[1]
    return ret

def _dict_to_query_string(x: Dict[str, str]):
    ret = ''
    for k, v in x.items():
        if ret != '':
            ret = ret + '&'
        ret = ret + f'{k}={v}'
    return ret


def _delete_sorting(*, feed: kc.Feed, sorting_id: str):
    subfeed = feed.load_subfeed('main')
    messages = _get_messages_from_subfeed(subfeed)
    le_sortings = _get_recordings_from_subfeed_messages(messages)
    if sorting_id not in le_sortings:
        print(f'Cannot remove sorting. Sorting not found: {sorting_id}')
    subfeed.append_message({
        'action': {
            'type': 'DELETE_SORTINGS',
            'sortingIds': [sorting_id]
        }
    })