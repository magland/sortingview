import numpy as np
import kachery_client as kc
import hither2 as hi
from sortingview import experitime
from sortingview.config import job_cache, job_handler
from sortingview.experitime import timeseries
from sortingview.serialize_wrapper import serialize_wrapper

@hi.function('get_experitime_timeseries_samples', '0.1.2')
@serialize_wrapper
def get_experitime_timeseries_samples(timeseries_uri: str, channel_name: str, ds_factor: int, segment_num: int, segment_duration_sec: float):
    t1 = segment_num * segment_duration_sec
    t2 = (segment_num + 1) * segment_duration_sec
    x = experitime.Timeseries(timeseries_uri)
    timestamps, values = x.get_samples(start=t1, end=t2, channels=[channel_name])
    values = values.ravel()
    if ds_factor > 1:
        N = len(timestamps)
        N2 = int(N / ds_factor)
        timestamps = timestamps[:N2 * ds_factor]
        values = values[:N2 * ds_factor]
        timestamps_reshaped = timestamps.reshape((N2, ds_factor))
        values_reshaped = values.reshape((N2, ds_factor))
        values_min = np.min(values_reshaped, axis=1)
        values_max = np.max(values_reshaped, axis=1)        
        values = np.zeros((N2 * 2,))
        values[0::2] = values_min
        values[1::2] = values_max
        timestamps = timestamps_reshaped[:, 0].ravel()
    return {
        'timestamps': timestamps.astype(np.float32),
        'values': values.astype(np.float32)
    }
    

@kc.taskfunction('experitime.get_timeseries_samples.2', type='pure-calculation')
def task_get_timeseries_samples(timeseries_uri, channel_name: str, ds_factor: int, segment_num: int, segment_duration_sec: float):
    with hi.Config(job_handler=job_handler.misc, job_cache=job_cache):
        return hi.Job(get_experitime_timeseries_samples, {'timeseries_uri': timeseries_uri, 'channel_name': channel_name, 'ds_factor': ds_factor, 'segment_num': segment_num, 'segment_duration_sec': segment_duration_sec})

@hi.function('get_experitime_timeseries_info', '0.1.2')
@serialize_wrapper
def get_experitime_timeseries_info(timeseries_uri: str):
    x = experitime.Timeseries(timeseries_uri)
    return {
        'uri': timeseries_uri,
        'object': x.object,
        'channelProperties': x.channel_properties,
        'channelNames': x.channel_names,
        'numSamples': x.num_samples,
        'startTime': x.start_time,
        'samplingFrequency': x.sampling_frequency,
        'endTime': x.end_time,
        'type': x.type
    }

@kc.taskfunction('experitime.get_timeseries_info.2', type='pure-calculation')
def task_get_timeseries_info(timeseries_uri):
    with hi.Config(job_handler=job_handler.misc, job_cache=job_cache):
        return hi.Job(get_experitime_timeseries_info, {'timeseries_uri': timeseries_uri})