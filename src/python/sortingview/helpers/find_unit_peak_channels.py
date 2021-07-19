import numpy as np
import spikeextractors as se
from .get_unit_waveforms import get_unit_waveforms
from .SubsampledSortingExtractor import SubsampledSortingExtractor

def find_unit_peak_channels(recording, sorting, unit_ids):
    # Use the first part of the recording to estimate the peak channels
    sorting_shortened = SubsampledSortingExtractor(parent_sorting=sorting, max_events_per_unit=20, method='truncate')
    max_time = 0
    for unit_id in sorting_shortened.get_unit_ids():
        st = sorting_shortened.get_unit_spike_train(unit_id=unit_id)
        if len(st) > 0:
            max_time = max(max_time, np.max(st))
    recording_shortened = se.SubRecordingExtractor(parent_recording=recording, start_frame=0, end_frame=max_time + 1)
    unit_waveforms = get_unit_waveforms(
        recording=recording_shortened,
        sorting=sorting_shortened,
        unit_ids=unit_ids,
        channel_ids_by_unit=None,
        snippet_len=(10, 10)
    )
    channel_ids = recording.get_channel_ids()
    peak_channels = {}
    for ii, unit_id in enumerate(unit_ids):
        average_waveform = np.median(unit_waveforms[ii], axis=0)
        peak_channel_index = int(np.argmax(np.max(average_waveform, axis=1) - np.min(average_waveform, axis=1)))
        peak_channels[unit_id] = int(channel_ids[peak_channel_index])
    return peak_channels
