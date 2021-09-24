import spikeextractors as se
import spikeinterface as si

class WrapperRecordingExtractor(se.RecordingExtractor):
    extractor_name = 'SpikeInterfaceRecordingExtractor'
    is_writable = False
    def __init__(self, new_recording: si.BaseRecording):
        se.RecordingExtractor.__init__(self)
        
        self._new_recording = new_recording

        for id in new_recording.get_channel_ids():
            pos = new_recording.get_channel_property(id, 'location')
            self.set_channel_property(id, 'location', pos)

    def get_channel_ids(self):
        return [int(id) for id in self._new_recording.channel_ids]

    def get_num_frames(self):
        return self._new_recording.get_num_frames()

    def get_sampling_frequency(self):
        return self._new_recording.get_sampling_frequency()

    def get_traces(self, channel_ids=None, start_frame=None, end_frame=None, return_scaled=True):
        X = self._new_recording.get_traces(
            segment_index=0,
            start_frame=start_frame,
            end_frame=end_frame,
            channel_ids=channel_ids,
        )
        return X.T