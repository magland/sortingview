import kachery_cloud as kcl
import numpy as np
import spikeextractors as se


class Bin2RecordingExtractor(se.RecordingExtractor):
    extractor_name = 'Bin2RecordingExtractor'
    is_writable = False
    def __init__(self, *, raw, dtype: str, raw_num_channels, num_frames, samplerate, channel_ids, channel_map, channel_positions):
        se.RecordingExtractor.__init__(self)
        
        self._raw = raw
        self._dtype = dtype
        self._num_frames = num_frames
        self._samplerate = samplerate
        self._raw_num_channels = raw_num_channels
        self._channel_ids = channel_ids
        self._channel_map = channel_map
        self._channel_positions = channel_positions
        
        for id in self._channel_ids:
            pos = self._channel_positions[str(id)]
            self.set_channel_property(id, 'location', pos)

    def get_channel_ids(self):
        return self._channel_ids

    def get_num_frames(self):
        return self._num_frames

    def get_sampling_frequency(self):
        return self._samplerate

    def get_traces(self, channel_ids=None, start_frame=None, end_frame=None, return_scaled=True):
        if start_frame is None:
            start_frame = 0
        if end_frame is None:
            end_frame = self._num_frames
        if channel_ids is None:
            channel_ids = self._channel_ids
        # M = len(channel_ids)
        # N = end_frame - start_frame

        if self._dtype == 'int16':
            num_bytes_per_entry = 2
        elif self._dtype == 'int32':
            num_bytes_per_entry = 4
        elif self._dtype == 'int64':
            num_bytes_per_entry = 8
        elif self._dtype == 'float32':
            num_bytes_per_entry = 4
        elif self._dtype == 'float64':
            num_bytes_per_entry = 8
        else:
            raise Exception(f'Unexpected dtype: {self._dtype}')
        
        i1 = start_frame * num_bytes_per_entry * self._raw_num_channels
        i2 = end_frame * num_bytes_per_entry * self._raw_num_channels
        
        buf = kcl.load_bytes(self._raw, start=i1, end=i2)
        if buf is None:
            raise Exception(f'Unable to find file: {self._raw}')
        X = np.frombuffer(buf, dtype=self._dtype).reshape((end_frame - start_frame, self._raw_num_channels))
        
        # old method
        # ret = np.zeros((M, N))
        # for ii, ch_id in enumerate(channel_ids):
        #     ret[ii, :] = X[:, self._channel_map[str(ch_id)]]

        # new (equivalent method)
        X = X.T.copy() # this is the part we want to try to speed up
        ret = X[[int(self._channel_map[str(ch_id)]) for ch_id in channel_ids]]
        
        return ret
