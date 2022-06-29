from typing import List
import kachery_cloud as kcl


def _get_sorting_curation(feed: kcl.Feed):
    feed.set_position(0)
    labels_by_unit = {}
    merge_groups = []
    is_closed = False
    while True:
        msgs = feed.get_next_messages(timeout_sec=0.1)
        if msgs is None: break
        if len(msgs) == 0: break
        for a in msgs:
            message_type = a.get('type', None)
            assert message_type is not None, "Feed contained message with no type."
            # if is_closed and message_type != 'REOPEN_CURATION':
            #    raise Exception('ERROR: feed attempts curation on a closed curation object.')
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