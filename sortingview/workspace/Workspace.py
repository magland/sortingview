import json
from copy import deepcopy
from typing import Dict, List, Tuple, Union
import uuid
import kachery_cloud as kcl
import spikeinterface as si

from ._get_sorting_curation import _get_sorting_curation
from ..load_extractors.load_recording_extractor import load_recording_extractor
from ..load_extractors.load_sorting_extractor import load_sorting_extractor
from ..load_extractors.get_recording_object import get_recording_object
from ..load_extractors.get_sorting_object import get_sorting_object


class Workspace:
    def __init__(self, uri: str) -> None:
        self._uri = uri
        if uri.startswith('workspace://'):
            from ._old_workspace import parse_old_workspace_uri, get_messages_from_old_workspace
            old_feed_id, old_query_string = parse_old_workspace_uri(uri)
            messages = get_messages_from_old_workspace(old_feed_id)
            self._feed_id = None
            self._feed = None
            self._query_string = old_query_string
            self._query = _query_string_to_dict(old_query_string)
        else:
            self._feed_id, self._query_string, self._query = parse_workspace_uri(uri)
            self._feed = kcl.load_feed(self._feed_id)
            messages = _get_messages_from_feed(self._feed)
        self._recording_records = _get_recording_records_from_feed_messages(messages)
        self._sorting_records = _get_sorting_records_from_feed_messages(messages)
        self._unit_metrics_for_sortings = _get_unit_metrics_for_sortings_from_feed_messages(messages)
        self._snippet_len: Tuple[int, int] = _get_snippet_len_from_feed_messages(messages)
        self._curation_feeds_for_sortings = _get_curation_feeds_for_sortings_from_feed_messages(messages)
        self._label = self._query.get('label', None)
    @property
    def uri(self):
        if self._feed is None:
            # old workspace
            return self._uri
        q = f'?{self._query_string}' if self._query_string else ''
        return f'sortingview-workspace:{self._feed.feed_id}{q}'
    @property
    def feed_uri(self):
        if self._feed is None:
            raise Exception('Cannot get feed_uri for old workspace')
        return f'feed://{self._feed.feed_id}'
    @property
    def feed_id(self):
        if self._feed is None:
            raise Exception('Cannot get feed_id for old workspace')
        return self._feed.feed_id
    @property
    def feed(self):
        return self._feed
    @property
    def label(self):
        return self._label
    def set_label(self, label: str):
        if self._feed is None:
            raise Exception('Cannot set label for old workspace')
        p = _query_string_to_dict(self._query_string)
        if label:
            p['label'] = label
        else:
            if 'label' in p:
                del p['label']
        self._query_string = _dict_to_query_string(p)
    def add_recording(self, *, label: str, recording: si.BaseRecording):
        if self._feed is None:
            raise Exception('Cannot add recording for old workspace')
        recording_object = get_recording_object(recording)
        recording_id = 'R-' + _random_id()
        if recording_id in self._recording_records:
            raise Exception(f'Duplicate recording ID: {recording_id}')
        x = {
            'recordingId': recording_id,
            'recordingLabel': label,
            'recordingPath': kcl.store_json(recording_object, label=f'{label}.json'),
            'recordingObject': recording_object,
            'description': f'Imported from Python: {label}'
        }
        print(f'Adding recording: {recording_id}')
        self._feed.append_message({
            'action': {
                'type': 'ADD_RECORDING',
                'recording': x
            }
        })
        self._recording_records[recording_id] = x
        return recording_id
    def add_sorting(self, *, recording_id: str, label: str, sorting: si.BaseSorting):
        if self._feed is None:
            raise Exception('Cannot add sorting for old workspace')
        sorting_object = get_sorting_object(sorting)
        sorting_id = 'S-' + _random_id()
        if recording_id not in self._recording_records:
            raise Exception(f'Recording not found: {recording_id}')
        if sorting_id in self._sorting_records:
            raise Exception(f'Duplicate sorting ID: {sorting_id}')
        sv_recording_record = self._recording_records[recording_id]
        x = {
            'sortingId': sorting_id,
            'sortingLabel': label,
            'sortingPath': kcl.store_json(sorting_object, label=f'{label}.json'),
            'sortingObject': sorting_object,

            'recordingId': recording_id,
            'recordingPath': sv_recording_record['recordingPath'],
            'recordingObject': sv_recording_record['recordingObject'],

            'description': f'Imported from Python: {label}'
        }
        print(f'Adding sorting: {sorting_id}')
        self._feed.append_message({
            'action': {
                'type': 'ADD_SORTING',
                'sorting': x
            }
        })
        self._sorting_records[sorting_id] = x
        return sorting_id
    def set_unit_metrics_for_sorting(self, *, sorting_id: str, metrics: List[dict]):
        if self._feed is None:
            raise Exception('Cannot set unit metrics for old workspace')
        metrics_uri = kcl.store_json(metrics, label='unit_metrics.json')
        x = {
            'sortingId': sorting_id,
            'metricsUri': metrics_uri
        }
        self._feed.append_message({
            'action': {
                'type': 'SET_UNIT_METRICS_FOR_SORTING',
                'unitMetricsForSorting': x
            }
        })
        self._unit_metrics_for_sortings[sorting_id] = metrics
    def create_curation_feed_for_sorting(self, *, sorting_id: str):
        if self._feed is None:
            raise Exception('Cannot create curation feed for old workspace')
        feed = kcl.create_feed()
        uri = feed.uri
        self._feed.append_message({
            'action': {
                'type': 'SET_CURATION_FEED_FOR_SORTING',
                'sortingId': sorting_id,
                'curationFeedUri': uri
            }
        })
        self._curation_feeds_for_sortings[sorting_id] = feed
        return feed
    def get_unit_metrics_for_sorting(self, sorting_id: str):
        return self._unit_metrics_for_sortings.get(sorting_id, [])
    def get_curation_feed_for_sorting(self, sorting_id: str) -> Union[kcl.Feed, None]:
        return self._curation_feeds_for_sortings.get(sorting_id, None)
    def delete_recording(self, recording_id: str):
        if self._feed is None:
            raise Exception('Cannot delete recording for old workspace')
        if recording_id not in self._recording_records:
            raise Exception(f'Recording not found: {recording_id}')
        self._feed.append_message({
            'action': {
                'type': 'DELETE_RECORDINGS',
                'recordingIds': [recording_id]
            }
        })
        sorting_ids_to_delete = self.get_sorting_ids_for_recording(recording_id)
        if len(sorting_ids_to_delete) > 0:
            self._feed.append_message({
                'action': {
                    'type': 'DELETE_SORTINGS',
                    'sortingIds': sorting_ids_to_delete
                }
            })
            for sorting_id in sorting_ids_to_delete:
                del self._sorting_records[sorting_id]
        del self._recording_records[recording_id]
    def delete_sorting(self, sorting_id: str):
        if self._feed is None:
            raise Exception('Cannot delete sorting for old workspace')
        if sorting_id not in self._sorting_records:
            raise Exception(f'Sorting not found: {sorting_id}')
        self._feed.append_message({
            'action': {
                'type': 'DELETE_SORTINGS',
                'sortingIds': [sorting_id]
            }
        })
        del self._sorting_records[sorting_id]
    def set_sorting_curation_authorized_users(self, *, sorting_id: str, user_ids: List[str]):
        if self._feed is None:
            raise Exception('Cannot set sorting curation authorized users for old workspace')
        feed = self.get_curation_feed_for_sorting(sorting_id)
        if feed is None:
            raise Exception('No sorting curation feed')
        kcl.set_mutable(f'@sortingview/@sortingCurationAuthorizedUsers/{feed.feed_id}', json.dumps(user_ids))
    def get_sorting_curation_authorized_users(self, *, sorting_id: str):
        if self._feed is None:
            raise Exception('Cannot get sorting curation authorized users for old workspace')
        feed = self.get_curation_feed_for_sorting(sorting_id)
        if feed is None:
            raise Exception('No sorting curation feed')
        a = kcl.get_mutable(f'@sortingview/@sortingCurationAuthorizedUsers/{feed.feed_id}')
        if a is None:
            return []
        return json.loads(a)
    def set_snippet_len(self, snippet_len: Tuple[int, int]):
        if self._feed is None:
            raise Exception('Cannot set_snippet_len for old workspace')
        self._feed.append_message({
            'action': {
                'type': 'SET_SNIPPET_LEN',
                'snippetLen': snippet_len
            }
        })
        self._snippet_len = snippet_len
    @property
    def snippet_len(self):
        return self._snippet_len
    def get_recording_record(self, recording_id: str):
        return deepcopy(self._recording_records[recording_id])
    def get_sorting_record(self, sorting_id: str):
        return deepcopy(self._sorting_records[sorting_id])
    @property
    def recording_ids(self):
        return list(self._recording_records.keys())
    @property
    def sorting_ids(self):
        return list(self._sorting_records.keys())
    def get_sorting_ids_for_recording(self, recording_id: str):
        return [sid for sid in self.sorting_ids if self.get_sorting_record(sid)['recordingId'] == recording_id]
    def get_recording_extractor(self, recording_id):
        r = self.get_recording_record(recording_id)
        recording_object = r['recordingObject']
        if self._feed is None:
            from ._old_workspace import _migrate_files_from_old_kachery_recursive
            # old workspace, maybe we need to bring sha1 files over to new system
            recording_object = _migrate_files_from_old_kachery_recursive(recording_object)
        return load_recording_extractor(recording_object)
    def get_sorting_extractor(self, sorting_id):
        s = self.get_sorting_record(sorting_id)
        sorting_object = s['sortingObject']
        if self._feed is None:
            from ._old_workspace import _migrate_files_from_old_kachery_recursive
            # old workspace, maybe we need to bring sha1 files over to new system
            sorting_object = _migrate_files_from_old_kachery_recursive(sorting_object)
        return load_sorting_extractor(sorting_object)
    def get_sorting_curation(self, sorting_id: str):
        if self._feed is None:
            return self._get_sorting_curation_for_old_workspace(sorting_id)
        curation_feed = self.get_curation_feed_for_sorting(sorting_id)
        return _get_sorting_curation(curation_feed)
    def get_sorting_curation_uri(self, sorting_id: str):
        curation_feed = self.get_curation_feed_for_sorting(sorting_id)
        if curation_feed is None:
            return None
        return curation_feed.uri
    def get_curated_sorting_extractor(self, sorting_id):
        s = self.get_sorting_record(sorting_id)
        sc = self.get_sorting_curation(sorting_id)
        return load_sorting_extractor({
            'sorting_format': 'curated',
            'data': {
                'sorting': s['sortingObject'],
                'merge_groups': sc.get('mergeGroups', [])
            }
        })
    def sorting_curation_add_label(self, *, sorting_id, label: Union[str, List[str]], unit_ids: Union[int, List[int]]):
        if self._feed is None:
            raise Exception('Cannot add label for old workspace')
        if isinstance(label, list):
            for l in label:
                action = {
                    'type': 'ADD_UNIT_LABEL',
                    'label': l,
                    'unitId': unit_ids
                }
                self.add_sorting_curation_action(sorting_id, action)
        else:
            action = {
                    'type': 'ADD_UNIT_LABEL',
                    'label': label,
                    'unitId': unit_ids
                }
            self.add_sorting_curation_action(sorting_id, action)
    def sorting_curation_remove_label(self, *, sorting_id, label: str, unit_ids: Union[int, List[int]]):
        if self._feed is None:
            raise Exception('Cannot remove label for old workspace')
        action = {
            'type': 'REMOVE_UNIT_LABEL',
            'label': label,
            'unitId': unit_ids
        }
        self.add_sorting_curation_action(sorting_id, action)
    def sorting_curation_merge_units(self, *, sorting_id, unit_ids: Union[int, List[int]]):
        if self._feed is None:
            raise Exception('Cannot merge units for old workspace')
        action = {
            'type': 'MERGE_UNITS',
            'unitIds': unit_ids
        }
        self.add_sorting_curation_action(sorting_id, action)
    def sorting_curation_unmerge_units(self, *, sorting_id, unit_ids: Union[int, List[int]]):
        if self._feed is None:
            raise Exception('Cannot unmerge units for old workspace')
        action = {
            'type': 'UNMERGE_UNITS',
            'unitIds': unit_ids
        }
        self.add_sorting_curation_action(sorting_id, action)
    def add_sorting_curation_action(self, sorting_id: str, action: dict):
        if self._feed is None:
            raise Exception('Cannot add sorting curation action for old workspace')
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
        if unitId_req is True:
            unit_ids = action['unitId']
            if not isinstance(unit_ids, list):
                if not isinstance(unit_ids, int):
                    raise ValueError(f'Invalid unitId: {unit_ids}, type: {type(unit_ids)}')
                else:
                    unit_ids = [unit_ids]
            if isinstance(unit_ids, list):
                if any(not isinstance(unit_id, int) for unit_id in unit_ids):
                    raise ValueError(f'Invalid unitIds: {unit_ids}, type not int')
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
        if unitIds_req is True:
            unit_ids = action['unitIds']
            if not isinstance(unit_ids, list):
                raise ValueError(f'Invalid unitIds: {unit_ids}, type: {type(unit_ids)}, action type: {action_type} expects list')
            # Check if unitId is valid for the sorting
            invalid_unit_list = [unit for unit in unit_ids if unit not in valid_unit_ids]
            if invalid_unit_list:
                raise ValueError(f'unitIds: {invalid_unit_list} are not valid unitIds for this sorting')
            if any(not isinstance(unit_id, int) for unit_id in unit_ids):
                raise ValueError(f'Invalid unitIds: {unit_ids}, type not int')
        else:
            # Check if unitId was passed improperly
            if 'unitIds' in action:
                if action['unitIds'] is not None:
                    raise ValueError(f'unitIds is invalid argument for action type: {action_type}')
        if (missing_label is True) or (action_type != 'ADD_UNIT_LABEL'):
            # Load the feed for the curation
            feed = self.get_curation_feed_for_sorting(sorting_id)
            # Append the action to the feed
            feed.append_message(action)
        else:
            print(f"Label: '{action['label']}' already appended with action type: {action_type} to all unitIds in action")
    def _get_sorting_curation_for_old_workspace(self, sorting_id: str):
        from ._old_workspace import parse_old_workspace_uri, get_sorting_curation_for_old_workspace
        old_feed_id, _ = parse_old_workspace_uri(self._uri)
        return get_sorting_curation_for_old_workspace(old_feed_id, sorting_id)
    from ._spikesortingview import spikesortingview


def parse_workspace_uri(workspace_uri: str):
    if not workspace_uri.startswith('sortingview-workspace:'):
        raise Exception(f'Invalid workspace uri: {workspace_uri}')
    if '?' not in workspace_uri:
        workspace_uri = workspace_uri + '?'
    # params = {}
    ind = workspace_uri.index('?')
    feed_id = workspace_uri[:ind].split(':')[1]
    query_string = workspace_uri[ind+1:]
    query = _query_string_to_dict(query_string)
    return feed_id, query_string, query

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

def _get_messages_from_feed(feed: kcl.Feed) -> List[dict]:
    messages: List[dict] = []
    while True:
        msgs = feed.get_next_messages()
        if len(msgs) == 0:
            break
        messages = [*messages, *msgs]
    return messages

def _get_recording_records_from_feed_messages(messages: List[dict]) -> Dict[str, dict]:
    sv_recording_records: Dict[str, dict] = {}
    for msg in messages:
        if 'action' in msg:
            a: dict = msg['action']
            msg_type = a.get('type', '')
            if msg_type == 'ADD_RECORDING':
                r = a.get('recording', {})
                rid = r.get('recordingId', '')
                sv_recording_records[rid] = r
            elif msg_type == 'DELETE_RECORDINGS':
                for rid in a.get('recordingIds', []):
                    if rid in sv_recording_records:
                        del sv_recording_records[rid]
    return sv_recording_records

def _get_sorting_records_from_feed_messages(messages: List[dict]) -> Dict[str, dict]:
    sv_sorting_records = {}
    for msg in messages:
        if 'action' in msg:
            a: dict = msg['action']
            msg_type = a.get('type', '')
            if msg_type == 'ADD_SORTING':
                s = a.get('sorting', {})
                sid = s.get('sortingId', '')
                sv_sorting_records[sid] = s
            elif msg_type == 'DELETE_SORTINGS':
                for sid in a.get('sortingIds', []):
                    if sid in sv_sorting_records:
                        del sv_sorting_records[sid]
            elif msg_type == 'DELETE_SORTINGS_FOR_RECORDINGS':
                for rid in a.get('recordingIds', []):
                    sids = list(sv_sorting_records.keys())
                    for sid in sids:
                        if sv_sorting_records[sid]['recordingId'] == rid:
                            del sv_sorting_records[sid]
            elif msg_type == 'DELETE_RECORDINGS':
                for rid in a.get('recordingIds', []):
                    sids = list(sv_sorting_records.keys())
                    for sid in sids:
                        if sv_sorting_records[sid]['recordingId'] == rid:
                            del sv_sorting_records[sid]
    return sv_sorting_records

def _get_unit_metrics_for_sortings_from_feed_messages(messages: List[dict]) -> Dict[str, dict]:
    sorting_records = _get_sorting_records_from_feed_messages(messages)
    sv_unit_metrics_for_sortings = {}
    for msg in messages:
        if 'action' in msg:
            a = msg['action']
            if a.get('type', '') == 'SET_UNIT_METRICS_FOR_SORTING':
                x = a.get('unitMetricsForSorting', {})
                sid = x.get('sortingId', '')
                uri = x.get('metricsUri')
                if sid in sorting_records:
                    sv_unit_metrics_for_sortings[sid] = kcl.load_json(uri)
    return sv_unit_metrics_for_sortings

def _get_snippet_len_from_feed_messages(messages: List[dict]) -> Tuple[int, int]:
    snippet_len = (50, 80)
    for msg in messages:
        if 'action' in msg:
            a: dict = msg['action']
            if a.get('type', '') == 'SET_SNIPPET_LEN':
                x = a.get('snippetLen', None)
                if x:
                    snippet_len = x
    return tuple(snippet_len)

def _get_curation_feeds_for_sortings_from_feed_messages(messages: List[dict]) -> Tuple[int, int]:
    curation_feeds_for_sortings = {}
    for msg in messages:
        if 'action' in msg:
            a = msg['action']
            if a.get('type', '') == 'SET_CURATION_FEED_FOR_SORTING':
                uri = a.get('curationFeedUri', None)
                sid = a.get('sortingId', None)
                if uri is not None and sid is not None:
                    curation_feeds_for_sortings[sid] = kcl.Feed.load(uri)
    return curation_feeds_for_sortings

def _random_id():
    return str(uuid.uuid4())[-12:]
