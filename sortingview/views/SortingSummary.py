from typing import Any, List
import numpy as np
from .View import View


class SortingSummary(View):
    """
    Sorting summary
    """
    def __init__(self, *,
        recording_description: str,
        sorting_description: str,
        recording_object: dict,
        sorting_object: dict,
        unit_ids: Any,
        channel_ids: Any,
        sampling_frequency: float,
        num_frames: int,
        num_segments: int,
        channel_locations: Any,
        noise_level: float,
        **kwargs
    ) -> None:
        super().__init__('Summary', **kwargs)
        self.recording_description = recording_description
        self.sorting_description = sorting_description
        self.recording_object = recording_object
        self.sorting_object = sorting_object
        self.unit_ids = unit_ids
        self.channel_ids = channel_ids
        self.sampling_frequency = sampling_frequency
        self.num_frames = num_frames
        self.num_segments = num_segments
        self.channel_locations = channel_locations
        self.noise_level = noise_level
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'recordingDescription': self.recording_description,
            'sortingDescription': self.sorting_description,
            'recordingObject': self.recording_object,
            'sortingObject': self.sorting_object,
            'unitIds': self.unit_ids,
            'channelIds': self.channel_ids,
            'samplingFrequency': float(self.sampling_frequency),
            'numFrames': self.num_frames,
            'numSegments': self.num_segments,
            'channelLocations': self.channel_locations.astype(np.float32),
            'noiseLevel': float(self.noise_level)
        }
        return ret
    def child_views(self) -> List[View]:
        return []
