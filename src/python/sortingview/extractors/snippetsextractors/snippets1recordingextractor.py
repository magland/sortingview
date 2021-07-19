from typing import List, Set

import h5py
import kachery_client as kc
import numpy as np
import spikeextractors as se


class Snippets1RecordingExtractor(se.RecordingExtractor):
    extractor_name = 'Snippets1RecordingExtractor'
    is_writable = False
    def __init__(self, *, snippets_h5_uri: str, p2p: bool=False):
        se.RecordingExtractor.__init__(self)

        snippets_h5_path = kc.load_file(snippets_h5_uri, p2p=p2p)
        
        self._snippets_h5_path: str = snippets_h5_path

        channel_ids_set: Set[int] = set()
        max_timepoint: int = 0
        with h5py.File(self._snippets_h5_path, 'r') as f:
            self._sampling_frequency: float = np.array(f.get('sampling_frequency'))[0]
            if np.isnan(self._sampling_frequency):
                print('WARNING: sampling frequency is nan. Using 30000 for now. Please correct the snippets file.')
                self._sampling_frequency = 30000
            self._unit_ids: List[int] = np.array(f.get('unit_ids')).astype(int).tolist()
            for unit_id in self._unit_ids:
                unit_spike_train = np.array(f.get(f'unit_spike_trains/{unit_id}'))
                max_timepoint = int(max(max_timepoint, np.max(unit_spike_train)))
                # unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms'))
                unit_waveforms_channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))
                for id in unit_waveforms_channel_ids:
                    channel_ids_set.add(int(id))
            self._channel_ids: List[int] = sorted(list(channel_ids_set))
            try:
                self._num_frames = f.get('num_frames')[0].item()
            except:
                print('Unable to load num_frames. Please update snippets file.')
                self._num_frames: int = max_timepoint + 1
            try:
                channel_locations = np.array(f.get(f'channel_locations'))
                self.set_channel_locations(channel_locations)
            except:
                print('WARNING: using [0, 0] for channel locations. Please adjust snippets file')
                for channel_id in self._channel_ids:
                    self.set_channel_property(channel_id, 'location', [0, 0])

    def get_channel_ids(self) -> List[int]:
        return self._channel_ids

    def get_num_frames(self) -> int:
        return self._num_frames

    def get_sampling_frequency(self) -> float:
        return self._sampling_frequency

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
