import h5py
import numpy as np

class SpikeSortingView:
    def __init__(self, data_file_name: str) -> None:
        self._data_file_name = data_file_name
        with h5py.File(data_file_name, 'r') as f:
            self._unit_ids = np.array(f.get('unit_ids'))
            self._sampling_frequency = np.array(f.get('sampling_frequency'))[0].item()
            self._channel_ids = np.array(f.get('channel_ids'))
            self._num_frames = np.array(f.get('num_frames'))[0].item()
            self._channel_locations = np.array(f.get('channel_locations'))
            self._num_segments = np.array(f.get('num_segments'))[0].item()
            self._num_frames_per_segment = np.array(f.get('num_frames_per_segment'))[0].item()
            a = np.array(f.get('snippet_len'))
            self._snippet_len = (a[0].item(), a[1].item())
            self._max_num_snippets_per_segment = np.array(f.get('max_num_snippets_per_segment'))[0].item()
            self._channel_neighborhood_size = np.array(f.get('channel_neighborhood_size'))[0].item()
    @property
    def unit_ids(self):
        return self._unit_ids
    @property
    def sampling_frequency(self):
        return self._sampling_frequency
    @property
    def channel_ids(self):
        return self._channel_ids
    @property
    def num_frames(self):
        return self._num_frames
    @property
    def channel_locations(self):
        return self._channel_locations
    @property
    def num_segments(self):
        return self._num_segments
    @property
    def num_frames_per_segment(self):
        return self._num_frames_per_segment
    @property
    def snippet_len(self):
        return self.snippet_len
    @property
    def max_num_snippets_per_segment(self):
        return self._max_num_snippets_per_segment
    @property
    def channel_neighborhood_size(self):
        return self._channel_neighborhood_size
    def get_unit_spike_train(self, *, unit_id: int):
        with h5py.File(self._data_file_name, 'r') as f:
            all = []
            for iseg in range(self.num_segments):
                st = np.array(f.get(f'segment/{iseg}/unit/{unit_id}/spike_train'))
                all.append(st)
            return np.concatenate(all)
    def get_unit_subsampled_spike_train(self, *, unit_id: int):
        with h5py.File(self._data_file_name, 'r') as f:
            all = []
            for iseg in range(self.num_segments):
                st = np.array(f.get(f'segment/{iseg}/unit/{unit_id}/subsampled_spike_train'))
                all.append(st)
            return np.concatenate(all)
    def get_unit_spike_amplitudes(self, *, unit_id: int):
        with h5py.File(self._data_file_name, 'r') as f:
            all = []
            for iseg in range(self.num_segments):
                amps = np.array(f.get(f'segment/{iseg}/unit/{unit_id}/spike_amplitudes'))
                all.append(amps)
            return np.concatenate(all)
    def get_unit_subsampled_spike_snippets(self, *, unit_id: int) -> np.ndarray:
        with h5py.File(self._data_file_name, 'r') as f:
            all = []
            for iseg in range(self.num_segments):
                snippets = np.array(f.get(f'segment/{iseg}/unit/{unit_id}/subsampled_spike_snippets'))
                all.append(snippets)
            return np.concatenate(all, axis=0)
    def get_unit_channel_neighborhood(self, *, unit_id: int):
        with h5py.File(self._data_file_name, 'r') as f:
            return np.array(f.get(f'unit/{unit_id}/channel_neighborhood'))
    def get_unit_peak_channel_id(self, *, unit_id: int):
        with h5py.File(self._data_file_name, 'r') as f:
            return np.array(f.get(f'unit/{unit_id}/peak_channel_id'))[0].item()
    