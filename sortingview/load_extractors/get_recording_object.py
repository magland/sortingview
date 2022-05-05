import os
import spikeinterface as si
import spikeinterface.extractors as se
import kachery_cloud as kcl


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
    else:
        raise Exception('Unable to create sortingview object from recording')
    setattr(recording, 'sortingview_object', recording_object)
    return recording_object