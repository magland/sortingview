from os import stat
from typing import List, Set

import h5py
import kachery_client as kc
import numpy as np
import spikeextractors as se

from .TimeseriesModel_Hdf5.TimeseriesModel_Hdf5 import TimeseriesModel_Hdf5, prepare_timeseries_hdf5_from_recording, set_geom_on_recording


class H5RecordingExtractorV1(se.RecordingExtractor):
    extractor_name = 'H5RecordingExtractorV1'
    is_writable = False
    def __init__(self, *, h5_path: str):
        se.RecordingExtractor.__init__(self)
        
        self._h5_path: str = h5_path
        self._timeseries_model = TimeseriesModel_Hdf5(self._h5_path)
        geom = self._timeseries_model.geom()
        if geom is not None:
            set_geom_on_recording(self, geom)

    def get_channel_ids(self) -> List[int]:
        return self._timeseries_model.channelIds()

    def get_num_frames(self) -> int:
        return self._timeseries_model.numTimepoints()

    def get_sampling_frequency(self) -> float:
        return self._timeseries_model.samplingFrequency()

    def get_traces(self, channel_ids=None, start_frame=None, end_frame=None, return_scaled=True):
        if start_frame is None:
            start_frame = 0
        if end_frame is None:
            end_frame = self.get_num_frames()
        if channel_ids is None:
            channel_ids = self.get_channel_ids()
        M = len(channel_ids)
        N = end_frame - start_frame

        all_channel_ids = self.get_channel_ids()
        channel_inds = [all_channel_ids.index(id) for id in channel_ids]

        return self._timeseries_model.getChunk(t1=start_frame, t2=end_frame, channel_inds=channel_inds)
    @staticmethod
    def write_recording(recording: se.RecordingExtractor, h5_path: str, dtype=float):
        hdf5_chunk_size = 10 * 1000 * 1000
        hdf5_padding = 10000
        prepare_timeseries_hdf5_from_recording(recording, h5_path, chunk_size=hdf5_chunk_size, padding=hdf5_padding, dtype=dtype)

