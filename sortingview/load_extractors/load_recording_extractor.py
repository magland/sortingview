from typing import Union
import spikeinterface as si
import spikeinterface.extractors as se2
import kachery_cloud as kcl
from kachery_cloud._serialize import _deserialize

from .MdaRecordingExtractorV2.MdaRecordingExtractorV2 import MdaRecordingExtractorV2


def load_recording_extractor(recording_object: Union[dict, str]):
    if isinstance(recording_object, str):
        if recording_object.startswith('sha1://') or recording_object.startswith('ipfs://'):
            oo = kcl.load_json(recording_object)
            return load_recording_extractor(oo)
        else:
            raise Exception(f'Unexpected URI: {recording_object}')
    if 'raw' in recording_object:
        return load_recording_extractor(dict(
            recording_format='mda',
            data=dict(
                raw=recording_object['raw'],
                geom=recording_object['geom'],
                params=recording_object['params']
            )
        ))
    recording_format = recording_object['recording_format']
    data = recording_object['data']
    data = _deserialize(data)
    if recording_format == 'mda':
        raw_uri = data['raw']
        raw_path = kcl.load_file(raw_uri, verbose=True)
        assert raw_path is not None
        geom = data.get('geom', None)
        params = data.get('params', None)
        assert raw_path is not None, f'Unable to load raw file: {raw_uri}'
        recording = MdaRecordingExtractorV2(raw_path=raw_path, params=params, geom=geom)
    elif recording_format == 'bin2':
        from .binextractors.bin2recordingextractor import Bin2RecordingExtractor
        recording_old = Bin2RecordingExtractor(**data)
        recording = si.old_api_utils.OldToNewRecording(recording_old)
    elif recording_format == 'nwb2':
        nwb_file_uri: str = data['nwb_file_uri']
        electrical_series_name: Union[str, None] = data.get('electrical_series_name', None)
        nwb_file_path = kcl.load_file(nwb_file_uri)
        assert nwb_file_path is not None
        if nwb_file_path is None:
            raise Exception(f'Unable to load nwb file: {nwb_file_uri}')
        recording = se2.NwbRecordingExtractor(file_path=nwb_file_path, electrical_series_name=electrical_series_name)
    elif recording_format == 'BinaryRecordingExtractor':
        file_paths = data['file_paths']
        file_paths_new = []
        for file_path in file_paths:
            a = kcl.load_file(file_path)
            if a is None:
                raise Exception(f'Unable to load file: {file_path}')
            file_paths_new.append(a)
        data['file_paths'] = file_paths_new
        channel_locations = data.get('channel_locations', None)
        if channel_locations is not None:
            del data['channel_locations']
        recording = se2.BinaryRecordingExtractor(**data)
        if channel_locations is not None:
            recording.set_channel_locations(channel_locations)
    elif recording_format == 'ConcatenateSegmentRecording':
        recording_list = [ load_recording_extractor(r) for r in data['recording_list'] ]
        recording = si.ConcatenateSegmentRecording(recording_list=recording_list)
    else:
        raise Exception(f'Unexpected recording format: {recording_format}')
    setattr(recording, 'sortingview_object', recording_object)
    return recording