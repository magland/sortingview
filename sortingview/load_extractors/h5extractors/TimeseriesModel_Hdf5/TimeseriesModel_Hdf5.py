import math
from typing import List, Union, cast
import numpy as np
import h5py
import spikeextractors as se
import spikeinterface as si

class TimeseriesModel_Hdf5:
    def __init__(self, path):
        self._hdf5_path = path
        with h5py.File(self._hdf5_path, "r") as f:
            self._num_chunks = np.array(f.get('num_chunks'))[0]
            self._chunk_size = np.array(f.get('chunk_size'))[0]
            self._padding = np.array(f.get('padding'))[0]
            self._num_channels = np.array(f.get('num_channels'))[0]
            self._num_timepoints = np.array(f.get('num_timepoints'))[0]
            self._sampling_frequency = np.array(f.get('sampling_frequency'))[0]
            self._channel_ids = np.array(f.get('channel_ids')).astype(int).tolist()
            self._geom = np.array(f.get('channel_geom', None))

    def channelIds(self) -> List[int]:
        return self._channel_ids

    def numChannels(self):
        return int(self._num_channels)

    def numTimepoints(self):
        return int(self._num_timepoints)

    def samplingFrequency(self):
        return float(self._sampling_frequency)
    
    def geom(self) -> Union[np.ndarray, None]:
        return self._geom

    def getChunk(self, *, t1: int, t2: int, channel_inds: List[int]):
        if (t1 < 0) or (t2 > self.numTimepoints()):
            ret = np.zeros((len(channel_inds), t2-t1))
            t1a = max(t1, 0)
            t2a = min(t2, self.numTimepoints())
            ret[:, t1a-(t1):t2a-(t1)] = self.getChunk(t1=t1a, t2=t2a, channel_inds=channel_inds)
            return ret
        else:
            c1 = int(t1/self._chunk_size)
            c2 = int((t2-1)/self._chunk_size)
            ret = np.zeros((len(channel_inds), t2-t1))
            with h5py.File(self._hdf5_path, "r") as f:
                for cc in range(c1, c2+1):
                    if cc == c1:
                        t1a = t1
                    else:
                        t1a = self._chunk_size*cc
                    if cc == c2:
                        t2a = t2
                    else:
                        t2a = self._chunk_size*(cc+1)
                    for ii in range(len(channel_inds)):
                        m = channel_inds[ii]
                        assert(cc >= 0)
                        assert(cc < self._num_chunks)
                        str = 'part-{}-{}'.format(m, cc)
                        offset = self._chunk_size*cc-self._padding
                        ret[ii, t1a-t1:t2a-t1] = cast(np.ndarray, f[str])[t1a-offset:t2a-offset]
            return ret


class TimeseriesModel_Recording:
    def __init__(self, recording):
        self._recording = recording

    def numChannels(self):
        return len(self._recording.get_channel_ids())

    def numTimepoints(self):
        return self._recording.get_num_frames()

    def getChunk(self, *, t1, t2, channels):
        channel_ids = self._recording.get_channel_ids()
        channels2 = np.zeros(len(channels))
        for i in range(len(channels)):
            channels2[i] = channel_ids[int(channels[i])]
        if (t1 < 0) or (t2 > self.numTimepoints()):
            ret = np.zeros((len(channels), t2-t1))
            t1a = np.maximum(t1, 0)
            t2a = np.minimum(t2, self.numTimepoints())
            ret[:, t1a-(t1):t2a-(t1)] = self.getChunk(t1=t1a,
                                                      t2=t2a, channels=channels)
            return ret
        else:
            return self._recording.get_traces(start_frame=t1, end_frame=t2, channel_ids=channels2)

def set_geom_on_recording(recording: se.RecordingExtractor, geom: np.ndarray):
    channel_ids = recording.get_channel_ids()
    for ii in range(len(channel_ids)):
        recording.set_channel_property(channel_ids[ii], 'location', geom[ii, :].tolist())

def geom_from_recording(recording: si.BaseRecording):
    channel_ids = recording.get_channel_ids()
    location0 = recording.get_channel_property(channel_ids[0], 'location')
    nd = len(location0)
    M = len(channel_ids)
    geom = np.zeros((M, nd))
    for ii in range(len(channel_ids)):
        location_ii = recording.get_channel_property(channel_ids[ii], 'location')
        geom[ii, :] = list(location_ii)
    return geom

def prepare_timeseries_hdf5_from_recording(recording: si.BaseRecording, timeseries_hdf5_fname: str, *, chunk_size: int, padding: int, dtype=float):
    chunk_size_with_padding = chunk_size+2*padding
    with h5py.File(timeseries_hdf5_fname, "w") as f:
        channel_ids = cast(List[int], recording.get_channel_ids())
        M = len(channel_ids)  # Number of channels
        N = cast(int, recording.get_num_frames())  # Number of timepoints
        num_chunks = math.ceil(N/chunk_size)
        f.create_dataset('chunk_size', data=[chunk_size])
        f.create_dataset('num_chunks', data=[num_chunks])
        f.create_dataset('padding', data=[padding])
        f.create_dataset('num_channels', data=[M])
        f.create_dataset('num_timepoints', data=[N])
        f.create_dataset('sampling_frequency', data=[recording.get_sampling_frequency()])
        f.create_dataset('channel_ids', data=channel_ids)
        f.create_dataset('channel_geom', data=geom_from_recording(recording))

        for j in range(num_chunks):
            padded_chunk = np.zeros(
                (M, chunk_size_with_padding), dtype=dtype)  # fix dtype here
            t1 = int(j*chunk_size)  # first timepoint of the chunk
            # last timepoint of chunk (+1)
            t2 = min(N, (t1+chunk_size))
            # first timepoint including the padding
            s1 = max(0, t1-padding)
            # last timepoint (+1) including the padding
            s2 = min(N, t2+padding)

            # determine aa so that t1-s1+aa = padding
            # so, aa = padding-(t1-s1)
            aa = padding-(t1-s1)
            # Read the padded chunk
            padded_chunk[:, aa:aa+s2 -
                         s1] = recording.get_traces(start_frame=s1, end_frame=s2).T

            for m in range(M):
                f.create_dataset('part-{}-{}'.format(m, j),
                                 data=padded_chunk[m, :].ravel())