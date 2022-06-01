import random
import spikeinterface as si
import kachery_cloud as kcl

from .get_recording_object import get_recording_object
from .load_recording_extractor import load_recording_extractor


def copy_recording_extractor(recording: si.BaseRecording, *, serialize_dtype=None, upload_traces: bool=False):
    if serialize_dtype is None:
        raise Exception('You must specify the serialize_dtype when serializing recording extractor')
    with kcl.TemporaryDirectory() as tmpdir:
        fname = tmpdir + '/' + _random_string(10) + '_recording.dat'
        # se.BinDatRecordingExtractor.write_recording(recording=recording, save_path=fname, time_axis=0, dtype=serialize_dtype)
        # with ka.config(use_hard_links=True):
        recording.get_traces(segment_index=0).astype(serialize_dtype).tofile(fname)
        if not upload_traces:
            uri = kcl.store_file_local(fname, label='raw.dat')
        else:
            uri = kcl.store_file(fname, label='raw.dat')
        num_channels = recording.get_num_channels()
        channel_ids = [int(a) for a in recording.get_channel_ids()]
        xcoords = [recording.get_channel_property(a, 'location')[0] for a in channel_ids]
        ycoords = [recording.get_channel_property(a, 'location')[1] for a in channel_ids]
        recording_object = {
            'recording_format': 'bin2',
            'data': {
                'raw': uri,
                'dtype': serialize_dtype,
                'raw_num_channels': num_channels,
                'num_frames': int(recording.get_num_frames(segment_index=0)),
                'samplerate': float(recording.get_sampling_frequency()),
                'channel_ids': channel_ids,
                'channel_map': dict(zip([str(c) for c in channel_ids], [int(i) for i in range(num_channels)])),
                'channel_positions': dict(zip([str(c) for c in channel_ids], [[float(xcoords[i]), float(ycoords[i])] for i in range(num_channels)]))
            }
        }
        return load_recording_extractor(recording_object)

def upload_recording_extractor(recording: si.BaseRecording, *, serialize_dtype=None, label: str):
    R = copy_recording_extractor(recording, serialize_dtype=serialize_dtype, upload_traces=True)
    obj = get_recording_object(R)
    return kcl.store_json(obj, label=label)

def _random_string(num_chars: int) -> str:
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return ''.join(random.choice(chars) for _ in range(num_chars))
