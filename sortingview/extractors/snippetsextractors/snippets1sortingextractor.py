from typing import List, Set, Union

import h5py
import kachery_client as kc
import numpy as np
import spikeextractors as se


class Snippets1SortingExtractor(se.SortingExtractor):
    extractor_name = 'Snippets1SortingExtractor'
    is_writable = False
    def __init__(self, *, snippets_h5_uri: str, p2p: bool=False):
        se.RecordingExtractor.__init__(self)

        snippets_h5_path = kc.load_file(snippets_h5_uri, p2p=p2p)
        
        self._snippets_h5_path: str = snippets_h5_path

        channel_ids_set: Set[int] = set()
        max_timepoint: int = 0
        with h5py.File(self._snippets_h5_path, 'r') as f:
            sampling_frequency: float = np.array(f.get('sampling_frequency'))[0]
            if np.isnan(sampling_frequency):
                print('WARNING: sampling frequency is nan. Using 30000 for now. Please correct the snippets file.')
                sampling_frequency = 30000
            self.set_sampling_frequency(sampling_frequency)
            self._unit_ids: List[int] = np.array(f.get('unit_ids')).astype(int).tolist()
            for unit_id in self._unit_ids:
                unit_spike_train = np.array(f.get(f'unit_spike_trains/{unit_id}'))
                max_timepoint = int(max(max_timepoint, np.max(unit_spike_train)))
                # unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms'))
                unit_waveforms_channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))
                for id in unit_waveforms_channel_ids:
                    channel_ids_set.add(int(id))
        self._channel_ids: List[int] = sorted(list(channel_ids_set))
        self._num_frames: int = max_timepoint + 1

    def get_unit_ids(self) -> List[int]:
        return self._unit_ids

    def get_unit_spike_train(self, unit_id: int, start_frame: Union[None, int], end_frame: Union[None, int]) -> int:
        with h5py.File(self._snippets_h5_path, 'r') as f:
            unit_spike_train = np.array(f.get(f'unit_spike_trains/{unit_id}'))
            if start_frame is not None:
                assert end_frame is not None
                return unit_spike_train[(start_frame <= unit_spike_train) & (unit_spike_train < end_frame)]
            else:
                return unit_spike_train

    def get_traces(self, channel_ids=None, start_frame=None, end_frame=None, return_scaled=True):
        if start_frame is None:
            start_frame = 0
        if end_frame is None:
            end_frame = self._num_frames
        if channel_ids is None:
            channel_ids = self._channel_ids
        M = len(channel_ids)
        N = end_frame - start_frame

        # For now, just return zeros
        return np.zeros((M, N))
