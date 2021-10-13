import numpy as np
import spikeextractors as se

def create_recording_from_old_extractor(rx: se.RecordingExtractor):
    import spikeinterface as si
    class RecordingSegmentWrapper(si.BaseRecordingSegment):
        def __init__(self, rx: se.RecordingExtractor):
            si.BaseRecordingSegment.__init__(self)
            self._rx = rx
            self._channel_ids = np.array(rx.get_channel_ids())

        def get_num_samples(self):
            return self._rx.get_num_frames()

        def get_traces(self, start_frame, end_frame, channel_indices):
            if channel_indices is None:
                channel_ids = self._channel_ids
            else:
                channel_ids = self._channel_ids[channel_indices]
            return self._rx.get_traces(
                channel_ids=channel_ids,
                start_frame=start_frame,
                end_frame=end_frame
            ).T
            
    R = si.BaseRecording(
        sampling_frequency=rx.get_sampling_frequency(),
        channel_ids=rx.get_channel_ids(),
        dtype=np.int16
    )
    recording_segment = RecordingSegmentWrapper(rx)
    R.add_recording_segment(recording_segment)
    return R