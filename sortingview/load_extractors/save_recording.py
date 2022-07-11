from typing import Any
import spikeinterface as si


def save_recording(R: si.BaseRecording, *, format: str, filename: str, dtype: Any):
    if format == 'h5_v1':
        from .h5extractors.h5recordingextractorv1 import H5RecordingExtractorV1
        H5RecordingExtractorV1.write_recording(recording=R, h5_path=filename, dtype=dtype)
    else:
        raise Exception(f'Unsupported format: {format}')
