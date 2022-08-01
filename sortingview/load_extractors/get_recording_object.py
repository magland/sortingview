import os
import spikeinterface as si
import spikeinterface.extractors as se
import kachery_cloud as kcl
from kachery_cloud._serialize import _serialize
from pathlib import Path


def get_recording_object(recording: si.BaseRecording):
    if hasattr(recording, 'sortingview_object'):
        return recording.sortingview_object
    elif isinstance(recording, se.NwbRecordingExtractor):
        file_path = recording._file_path
        electrical_series_name = recording._electrical_series_name
        nwb_file_uri = kcl.store_file_local(file_path, label=os.path.basename(file_path), reference=True) # important to set reference=True
        recording_object = {
            'recording_format': 'nwb2',
            'data': {
                'nwb_file_uri': nwb_file_uri,
                'electrical_series_name': electrical_series_name
            }
        }
    elif isinstance(recording, se.BinaryRecordingExtractor):
        from pathlib import Path
        data = recording._kwargs
        if isinstance(recording, si.BinaryFolderRecording):
            folder_path = Path(data['folder_path'])
            data = recording._bin_kwargs
        else:
            folder_path = Path('/')
        file_paths = data['file_paths']
        data['file_paths'] = [
            kcl.store_file_local(
                str(folder_path / file_path),
                label=os.path.basename(file_path),
                reference=True # important
            )
            for file_path in file_paths
        ]
        data['channel_locations'] = recording.get_channel_locations()
        recording_object = {
            'recording_format': 'BinaryRecordingExtractor',
            'data': data
        }
    elif isinstance(recording, si.ConcatenateSegmentRecording):
        data = {
            'recording_list': [get_recording_object(r) for r in recording.recording_list]
        }
        recording_object = {
            'recording_format': 'ConcatenateSegmentRecording',
            'data': data
        }
    else:
        raise Exception('Unable to create sortingview object from recording')
    recording_object = _serialize(recording_object)
    setattr(recording, 'sortingview_object', recording_object)
    return recording_object