import random


def _random_string(num_chars: int) -> str:
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return ''.join(random.choice(chars) for _ in range(num_chars))

unique_process_id = _random_string(20)
in_memory_objects = {}

def register_in_memory_object(obj):
    in_memory_objects[id(obj)] = obj
    return {
        'process_id': unique_process_id,
        'object_id': id(obj)
    }

def get_in_memory_object(a: dict):
    object_id = a['object_id']
    process_id = a['process_id']
    if process_id == unique_process_id:
        if object_id in in_memory_objects:
            return in_memory_objects[object_id]
    return None
