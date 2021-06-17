from typing import List, cast
import hither2 as hi
import labbox_ephys as le
import numpy as np
import spikeextractors as se
import kachery_client as kc
from sortingview.config import job_cache, job_handler

@hi.function(
    'recording_info', '0.1.3'
)
def recording_info(recording_uri):
    recording = le.LabboxEphysRecordingExtractor(recording_uri, download=False)
    return dict(
        sampling_frequency=recording.get_sampling_frequency(),
        channel_ids=recording.get_channel_ids(),
        channel_groups=recording.get_channel_groups().tolist(),
        geom=geom_from_recording(recording).tolist(),
        num_frames=recording.get_num_frames(),
        noise_level=estimate_noise_level(recording),
        recording_object=recording.object()
    )

@kc.taskfunction('recording_info.3', type='pure-calculation')
def task_recording_info(recording_uri: str):
    with hi.Config(job_handler=job_handler.misc, job_cache=job_cache):
        return hi.Job(recording_info, {'recording_uri': recording_uri})

def geom_from_recording(recording):
    channel_ids = recording.get_channel_ids()
    location0 = recording.get_channel_property(channel_ids[0], 'location')
    nd = len(location0)
    M = len(channel_ids)
    geom = np.zeros((M, nd))
    for ii in range(len(channel_ids)):
        location_ii = recording.get_channel_property(channel_ids[ii], 'location')
        geom[ii, :] = list(location_ii)
    return geom

def estimate_noise_level(recording: se.RecordingExtractor):
    N = cast(int, recording.get_num_frames())
    samplerate = cast(float, recording.get_sampling_frequency())
    start_frame = 0
    end_frame = np.minimum(int(samplerate), N)
    X = cast(np.ndarray, recording.get_traces(channel_ids=[int(id) for id in cast(List[int], recording.get_channel_ids())], start_frame=start_frame, end_frame=end_frame))
    X_mean_subtracted = _mean_subtract_on_channels(X)
    est_noise_level = np.median(np.abs(X_mean_subtracted.squeeze())) / 0.6745  # median absolute deviation (MAD) estimate of stdev
    if (est_noise_level == 0): est_noise_level = 1
    return est_noise_level

def _mean_subtract_on_channels(X: np.ndarray):
    return X - np.broadcast_to(np.mean(X, axis=1), (X.shape[1], X.shape[0])).T