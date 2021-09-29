from functools import wraps 
import base64
import numpy as np

def serialize_wrapper(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        output = f(*args, **kwargs)
        return _serialize(output)
    return wrapper

def _serialize(x):
    if isinstance(x, np.integer):
        return int(x)
    elif isinstance(x, np.floating):
        return float(x)
    elif type(x) == dict:
        ret = dict()
        for key, val in x.items():
            ret[key] = _serialize(val)
        return ret
    elif (type(x) == list) or (type(x) == tuple):
        return [_serialize(val) for val in x]
    elif isinstance(x, np.ndarray):
        # todo: worry about byte order and data type here
        return {
            '_type': 'ndarray',
            'shape': _serialize(x.shape),
            'dtype': str(x.dtype),
            'data_b64': base64.b64encode(x.ravel()).decode()
        }
    else:
        if _is_jsonable(x):
            # this will capture int, float, str, bool
            return x
    raise Exception(f'Item is not json safe: {type(x)}')

def _deserialize(x):
    if type(x) == dict:
        if x.get('_type', None) == 'ndarray':
            shape = x['shape']
            dtype = x['dtype']
            data_b64 = x['data_b64']
            data = base64.b64decode(data_b64)
            x = np.reshape(np.frombuffer(data, dtype=dtype), shape)
            return x
        else:
            ret = dict()
            for key, val in x.items():
                ret[key] = _deserialize(val)
            return ret
    elif (type(x) == list) or (type(x) == tuple):
        return [_serialize(val) for val in x]
    else:
        return x

def _is_jsonable(x) -> bool:
    import json
    try:
        json.dumps(x)
        return True
    except:
        return False