import seriesview as sev
from ..backend.extensions.spikeamplitudes.spikeamplitudes import runtask_fetch_spike_amplitudes
from ..extractors.labboxephysrecordingextractor import LabboxEphysRecordingExtractor
from ..extractors.labboxephyssortingextractor import LabboxEphysSortingExtractor

class SpikeAmplitudes:
    def __init__(self, *,
        recording: LabboxEphysRecordingExtractor,
        sorting: LabboxEphysSortingExtractor,
        unit_id: int,
        snippet_len=(50, 80)
    ) -> None:
        self._recording = recording
        self._sorting = sorting
        self._unit_id = unit_id
        self._snippet_len = snippet_len
    def prepare_series(self):
        x = runtask_fetch_spike_amplitudes(
            recording=self._recording,
            sorting=self._sorting,
            unit_id=self._unit_id,
            snippet_len=self._snippet_len
        )
        timepoints = x['timepoints']
        amplitudes = x['amplitudes']
        ts = sev.SVSeries.from_numpy(
            type='discrete',
            sampling_frequency=None,
            start_time=0,
            end_time=self._recording.get_num_frames() / self._recording.get_sampling_frequency(),
            segment_duration=10 * 60,
            timestamps=timepoints / self._recording.get_sampling_frequency(),
            values=amplitudes
        )
        return ts