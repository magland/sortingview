from typing import Union
import spikeinterface as si
import spikeinterface.extractors as se2
import kachery_cloud as kcl
from .MdaRecordingExtractorV2.MdaRecordingExtractorV2 import MdaRecordingExtractorV2
from .binextractors.bin2recordingextractor import Bin2RecordingExtractor


def load_recording_extractor(recording_object: dict):
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
    if recording_format == 'mda':
        raw_uri = data['raw']
        raw_path = kcl.load_file(raw_uri, verbose=True)
        geom = data.get('geom', None)
        params = data.get('params', None)
        assert raw_path is not None, f'Unable to load raw file: {raw_uri}'
        recording = MdaRecordingExtractorV2(raw_path=raw_path, params=params, geom=geom)
    elif recording_format == 'bin2':
        recording_old = Bin2RecordingExtractor(**data)
        recording = si.old_api_utils.OldToNewRecording(recording_old)
    elif recording_format == 'nwb2':
        nwb_file_uri: str = data['nwb_file_uri']
        electrical_series_name: Union[str, None] = data.get('electrical_series_name', None)
        nwb_file_path = kcl.load_file(nwb_file_uri)
        if nwb_file_path is None:
            raise Exception(f'Unable to load nwb file: {nwb_file_uri}')
        recording = se2.NwbRecordingExtractor(file_path=nwb_file_path, electrical_series_name=electrical_series_name)
    else:
        raise Exception(f'Unexpected recording format: {recording_format}')
    setattr(recording, 'sortingview_object', recording_object)
    return recording