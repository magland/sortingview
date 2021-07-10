import json
from typing import Any, Dict, List, Tuple, Union
import uuid
import kachery_client as kc
import spikeextractors as se
from labbox_ephys import LabboxEphysRecordingExtractor, LabboxEphysSortingExtractor

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
    def __init__(self, *, workspace_uri: str) -> None:
        feed_id, query_string = parse_workspace_uri(workspace_uri)
        self._query_string = query_string
        self._feed = kc.load_feed(f'feed://{feed_id}')
        main_subfeed = self._feed.load_subfeed('main')
        self._recordings = _get_recordings_from_subfeed(main_subfeed)
        self._sortings = _get_sortings_from_subfeed(main_subfeed)
        self._unit_metrics_for_sortings = _get_unit_metrics_for_sortings_from_subfeed(main_subfeed)
        self._user_permissions = _get_user_permissions_from_subfeed(main_subfeed)
        self._snippet_len: Tuple[int, int] = _get_snippet_len_from_subfeed(main_subfeed)
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
    def set_snippet_len(self, snippet_len: Tuple[int, int]):
        main_subfeed = self._feed.load_subfeed('main')
        _set_snippet_len_for_workspace(main_subfeed, snippet_len)
        self._snippet_len = snippet_len
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
    def get_sorting_curation(self, sorting_id: str):
        curation_subfeed = self._feed.load_subfeed(dict(name='sortingCuration', sortingId=sorting_id))
        return _get_sorting_curation(curation_subfeed, sorting_id=sorting_id)
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

def _get_recordings_from_subfeed(subfeed: kc.Subfeed):
    subfeed.set_position(0)
    le_recordings = {}
    while True:
        msg = subfeed.get_next_message(wait_msec=0)
        if msg is None: break
        if 'action' in msg:
            a = msg['action']
            if a.get('type', '') == 'ADD_RECORDING':
                r = a.get('recording', {})
                rid = r.get('recordingId', '')
                le_recordings[rid] = r
            elif a.get('type', '') == 'DELETE_RECORDINGS':
                for rid in a.get('recordingIds', []):
                    if rid in le_recordings:
                        del le_recordings[rid]
    return le_recordings

def _get_user_permissions_from_subfeed(subfeed: kc.Subfeed):
    subfeed.set_position(0)
    user_permissions = {}
    while True:
        msg = subfeed.get_next_message(wait_msec=0)
        if msg is None: break
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

def _get_snippet_len_from_subfeed(subfeed: kc.Subfeed):
    subfeed.set_position(0)
    snippet_len = (50, 80)
    while True:
        msg = subfeed.get_next_message(wait_msec=0)
        if msg is None: break
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

def _get_sortings_from_subfeed(subfeed: kc.Subfeed):
    subfeed.set_position(0)
    le_sortings = {}
    while True:
        msg = subfeed.get_next_message(wait_msec=0)
        if msg is None: break
        if 'action' in msg:
            a = msg['action']
            if a.get('type', '') == 'ADD_SORTING':
                s = a.get('sorting', {})
                sid = s.get('sortingId', '')
                le_sortings[sid] = s
            elif a.get('type', '') == 'DELETE_SORTINGS':
                for sid in a.get('sortingIds', []):
                    if sid in le_sortings:
                        del le_sortings[sid]
            elif a.get('type', '') == 'DELETE_SORTINGS_FOR_RECORDINGS':
                for rid in a.get('recordingIds', []):
                    sids = list(le_sortings.keys())
                    for sid in sids:
                        if le_sortings[sid]['recordingId'] == rid:
                            del le_sortings[sid]
            elif a.get('type', '') == 'DELETE_RECORDINGS':
                for rid in a.get('recordingIds', []):
                    sids = list(le_sortings.keys())
                    for sid in sids:
                        if le_sortings[sid]['recordingId'] == rid:
                            del le_sortings[sid]
    return le_sortings

def _get_unit_metrics_for_sortings_from_subfeed(subfeed: kc.Subfeed):
    subfeed.set_position(0)
    sortings = _get_sortings_from_subfeed(subfeed)
    le_unit_metrics_for_sortings = {}
    while True:
        msg = subfeed.get_next_message(wait_msec=0)
        if msg is None: break
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
    while True:
        a = subfeed.get_next_message(wait_msec=0)
        if a is None: break
        if a.get('type', '') == 'ADD_UNIT_LABEL':
            unit_id = a.get('unitId', '')
            label = a.get('label', '')
            if unit_id not in labels_by_unit:
                labels_by_unit[unit_id] = []
            labels_by_unit[unit_id].append(label)
            labels_by_unit[unit_id] = sorted(list(set(labels_by_unit[unit_id])))
        elif a.get('type', '') == 'REMOVE_UNIT_LABEL':
            unit_id = a.get('unitId', '')
            label = a.get('label', '')
            if unit_id in labels_by_unit:
                labels_by_unit[unit_id] = [x for x in labels_by_unit[unit_id] if x != label]
        elif a.get('type', 'MERGE_UNITS'):
            unit_ids = a.get('unitIds', [])
            merge_groups = _simplify_merge_groups(merge_groups + [unit_ids])
        elif a.get('type', 'UNMERGE_UNITS'):
            unit_ids = a.get('unitIds', [])
            merge_groups = _simplify_merge_groups([[u for u in mg if (u not in unit_ids)] for mg in merge_groups])
    return {
        'labelsByUnit': labels_by_unit,
        'mergeGroups': merge_groups
    }

def _import_le_recording(subfeed: kc.Subfeed, le_recording):
    le_recordings = _get_recordings_from_subfeed(subfeed)
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
    le_sortings = _get_sortings_from_subfeed(subfeed)
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
    le_recordings = _get_recordings_from_subfeed(subfeed)
    if recording_id not in le_recordings:
        print(f'Cannot remove recording. Recording not found: {recording_id}')
    subfeed.append_message({
        'action': {
            'type': 'DELETE_RECORDINGS',
            'recordingIds': [recording_id]
        }
    })
    le_sortings = _get_sortings_from_subfeed(subfeed)
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
    le_sortings = _get_recordings_from_subfeed(subfeed)
    if sorting_id not in le_sortings:
        print(f'Cannot remove sorting. Sorting not found: {sorting_id}')
    subfeed.append_message({
        'action': {
            'type': 'DELETE_SORTINGS',
            'sortingIds': [sorting_id]
        }
    })