import math
from typing import Union
from sortingview.extractors import LabboxEphysRecordingExtractor, LabboxEphysSortingExtractor

class SpikeSortingView:
    def __init__(self, *,
        recording: LabboxEphysRecordingExtractor,
        sorting: LabboxEphysSortingExtractor,
        segment_duration_minutes: float
    ) -> None:
        self._recording = recording
        self._sorting = sorting
        self._segment_duration_minutes = segment_duration_minutes
    @property
    def recording(self):
        return self._recording
    @property
    def sorting(self):
        return self._sorting
    @property
    def segment_duration_minutes(self):
        return self._segment_duration_minutes
    @property
    def duration_minutes(self):
        return self._recording.get_num_frames() / self._recording.get_sampling_frequency() / 60
    @property
    def num_segments(self):
        return math.ceil(self.duration_minutes / self.segment_duration_minutes)
    @property
    def unit_ids(self):
        return self._sorting.get_unit_ids()
    @property
    def channel_ids(self):
        return self._recording.get_channel_ids()
    @property
    def sampling_frequency(self):
        return self._recording.get_sampling_frequency()
    def get_segment(self, start_index: int, end_index: Union[int, None]=None):
        from .SSVSegment import SSVSegment
        if end_index is None:
            end_index = start_index + 1
        start_frame = start_index * self.segment_duration_minutes * 60 * self.sampling_frequency
        end_frame = min(start_frame + self._segment_duration_minutes * 60 * self.sampling_frequency, self._recording.get_num_frames())
        return SSVSegment(parent=self, start_frame=start_frame, end_frame=end_frame)