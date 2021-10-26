from .SpikeSortingView import SpikeSortingView

class SSVSegment:
    def __init__(self, *,
        parent: SpikeSortingView,
        start_frame: int,
        end_frame: int
    ) -> None:
        self._parent = parent
        self._start_frame = start_frame
        self._end_frame = end_frame
    @property
    def recording(self):
        return self._parent.recording
    @property
    def sorting(self):
        return self._parent.sorting
    @property
    def duration_minutes(self):
        return (self._end_frame - self._start_frame) / self.sampling_frequency / 60
    @property
    def start_frame(self):
        return self._start_frame
    @property
    def end_frame(self):
        return self._end_frame
    @property
    def start_minute(self):
        return self.start_frame / self.sampling_frequency / 60
    @property
    def end_minute(self):
        return self.end_frame / self.sampling_frequency / 60
    @property
    def unit_ids(self):
        return self._parent.unit_ids
    @property
    def channel_ids(self):
        return self._parent.channel_ids
    @property
    def sampling_frequency(self):
        return self._parent.sampling_frequency