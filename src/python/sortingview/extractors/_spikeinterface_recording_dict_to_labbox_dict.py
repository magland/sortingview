import numpy as np
import kachery_client as kc
import spikeextractors as se

def _load_geom_from_csv(path: str) -> list:
    return _listify_ndarray(np.genfromtxt(path, delimiter=',').T)

def _listify_ndarray(x: np.ndarray) -> list:
    if x.ndim == 1:
        if np.issubdtype(x.dtype, np.integer):
            return [int(val) for val in x]
        else:
            return [float(val) for val in x]
    elif x.ndim == 2:
        ret = []
        for j in range(x.shape[1]):
            ret.append(_listify_ndarray(x[:, j]))
        return ret
    elif x.ndim == 3:
        ret = []
        for j in range(x.shape[2]):
            ret.append(_listify_ndarray(x[:, :, j]))
        return ret
    elif x.ndim == 4:
        ret = []
        for j in range(x.shape[3]):
            ret.append(_listify_ndarray(x[:, :, :, j]))
        return ret
    else:
        raise Exception('Cannot listify ndarray with {} dims.'.format(x.ndim))


def spikeinterface_recording_dict_to_labbox_dict(x):
  c = x['class']
  if c == 'spiketoolkit.preprocessing.bandpass_filter.BandpassFilterRecording':
    kwargs = x['kwargs']
    recording = spikeinterface_recording_dict_to_labbox_dict(kwargs['recording'])
    freq_min = kwargs['freq_min']
    freq_max = kwargs['freq_max']
    freq_wid = kwargs['freq_wid']
    return _make_json_safe({
        'recording_format': 'filtered',
        'data': {
          'filters': [{'type': 'bandpass_filter', 'freq_min': freq_min, 'freq_max': freq_max, 'freq_wid': freq_wid}],
          'recording': recording
        }
    })
  elif c == 'spikeextractors.subrecordingextractor.SubRecordingExtractor':
    kwargs = x['kwargs']
    recording = spikeinterface_recording_dict_to_labbox_dict(kwargs['parent_recording'])
    channel_ids = kwargs['channel_ids']
    renamed_channel_ids = kwargs.get('renamed_channel_ids', None)
    start_frame = kwargs['start_frame']
    end_frame = kwargs['end_frame']
    if renamed_channel_ids is not None:
      raise Exception('renamed_channel_ids field not supported')
    return _make_json_safe({
        'recording_format': 'subrecording',
        'data': {
          'recording': recording,
          'channel_ids': channel_ids,
          'start_frame': start_frame,
          'end_frame': end_frame
        }
    })
  elif c == 'spikeextractors.extractors.mdaextractors.mdaextractors.MdaRecordingExtractor':
    kwargs = x['kwargs']
    path = kwargs['folder_path']
    raw_path = kc.load_file(path + '/raw.mda')
    params_path = path + '/params.json'
    geom_path = path + '/geom.csv'
    params = kc.load_json(params_path)
    assert params is not None, f'Unable to load params.json from: {params_path}'
    geom = _load_geom_from_csv(geom_path)
    return _make_json_safe({
        'recording_format': 'mda',
        'data': {
            'raw': raw_path,
            'geom': geom,
            'params': params
        }
    })
  else:
    raise Exception(f'Unsupported class: {c}')

def _make_json_safe(x):
    if isinstance(x, np.integer):
        return int(x)
    elif isinstance(x, np.floating):
        return float(x)
    elif type(x) == dict:
        ret = dict()
        for key, val in x.items():
            ret[key] = _make_json_safe(val)
        return ret
    elif (type(x) == list) or (type(x) == tuple):
        return [_make_json_safe(val) for val in x]
    elif isinstance(x, np.ndarray):
        raise Exception('Cannot make ndarray json safe')
    else:
        if _is_jsonable(x):
            # this will capture int, float, str, bool
            return x
    raise Exception(f'Item is not json safe: {type(x)}')

def _is_jsonable(x) -> bool:
    import json
    try:
        json.dumps(x)
        return True
    except:
        return False