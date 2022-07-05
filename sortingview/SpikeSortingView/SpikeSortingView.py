from typing import List, Tuple, Union
import spikeinterface as si
import kachery_cloud as kcl
import json
import h5py
import numpy as np
from sortingview.SpikeSortingView.prepare_spikesortingview_data import prepare_spikesortingview_data

class SpikeSortingView:
    def __init__(self, data_uri: str) -> None:
        self._data_uri = data_uri
        self._data_file_name = kcl.load_file(data_uri)
        if self._data_file_name is None:
            raise Exception(f'Unable to load spikesortingview data file: {data_uri}')
        with h5py.File(self._data_file_name, 'r') as f:
            self._recording_object = json.loads(f.attrs['recording_object'])
            self._sorting_object = json.loads(f.attrs['sorting_object'])
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
    @staticmethod
    def create(*,
        recording: si.BaseRecording,
        sorting: si.BaseSorting,
        segment_duration_sec: float,
        snippet_len: Tuple[int],
        max_num_snippets_per_segment: Union[int, None],
        channel_neighborhood_size: int
    ):
        data_uri = prepare_spikesortingview_data(
            recording=recording,
            sorting=sorting,
            segment_duration_sec=segment_duration_sec,
            snippet_len=snippet_len,
            max_num_snippets_per_segment=max_num_snippets_per_segment,
            channel_neighborhood_size=channel_neighborhood_size
        )
        return SpikeSortingView(data_uri)
    @property
    def data_uri(self):
        return self._data_uri
    @property
    def recording_object(self):
        return self._recording_object
    @property
    def sorting_object(self):
        return self._sorting_object
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
                if st.ndim == 1:
                    all.append(st)
            return np.concatenate(all)
    def get_unit_subsampled_spike_train(self, *, unit_id: int):
        with h5py.File(self._data_file_name, 'r') as f:
            all = []
            for iseg in range(self.num_segments):
                st = np.array(f.get(f'segment/{iseg}/unit/{unit_id}/subsampled_spike_train'))
                if st.ndim == 1:
                    all.append(st)
            return np.concatenate(all)
    def get_unit_spike_amplitudes(self, *, unit_id: int):
        with h5py.File(self._data_file_name, 'r') as f:
            all = []
            for iseg in range(self.num_segments):
                amps = np.array(f.get(f'segment/{iseg}/unit/{unit_id}/spike_amplitudes'))
                if amps.ndim == 1:
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
    def get_traces_sample(self, *, segment: int) -> np.ndarray:
        with h5py.File(self._data_file_name, 'r') as f:
            return np.array(f.get(f'segment/{segment}/traces_sample'))
    
    # The following member functions are implemented in separate files

    # older method
    from ._create_autocorrelograms import create_autocorrelograms
    from ._create_raster_plot import create_raster_plot
    from ._create_average_waveforms import create_average_waveforms
    from ._create_units_table import create_units_table
    from ._create_summary import create_summary
    from ._create_mountain_layout import create_mountain_layout
    from ._create_spike_amplitudes import create_spike_amplitudes
    from ._create_electrode_geometry import create_electrode_geometry
    from ._create_live_cross_correlograms import create_live_cross_correlograms

    # newest method
    from ._sorting_summary_view import sorting_summary_view
    from ._units_table_view import units_table_view
    from ._raster_plot_view import raster_plot_view
    from ._autocorrelograms_view import autocorrelograms_view
    from ._cross_correlograms_view import cross_correlograms_view
    from ._average_waveforms_view import average_waveforms_view
    from ._electrode_geometry_view import electrode_geometry_view
    from ._spike_amplitudes_view import spike_amplitudes_view