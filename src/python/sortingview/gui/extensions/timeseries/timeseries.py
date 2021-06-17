import labbox_ephys as le

# import base64
# import io

# import os
import hither2 as hi
import kachery_client as kc
# import time
import labbox_ephys as le
from labbox_ephys.helpers.prepare_snippets_h5 import prepare_snippets_h5
import numpy as np
from sortingview.config import job_cache, job_handler


@hi.function('createjob_get_timeseries_segment', '0.1.0', register_globally=True)
def createjob_get_timeseries_segment(labbox, recording_object, ds_factor, segment_num, segment_size):
    jh = labbox.get_job_handler('timeseries')
    jc = labbox.get_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        use_container=jh.is_remote()
    ):
        return get_timeseries_segment.run(recording_object=recording_object, ds_factor=ds_factor, segment_num=segment_num, segment_size=segment_size)

@kc.taskfunction('get_timeseries_segment.1', type='pure-calculation')
def task_get_timeseries_segment(recording_object, ds_factor, segment_num, segment_size):
    with hi.Config(job_handler=job_handler.timeseries, job_cache=job_cache):
        return get_timeseries_segment.run(recording_object=recording_object, ds_factor=ds_factor, segment_num=segment_num, segment_size=segment_size)


@hi.function(
    'get_timeseries_segment', '0.1.2',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['labbox_ephys']
)
@le.serialize
def get_timeseries_segment(recording_object, ds_factor, segment_num, segment_size):
    import time
    recording0 = le.LabboxEphysRecordingExtractor(recording_object, download=False)

    t1 = segment_num * segment_size * ds_factor
    t2 = ((segment_num + 1) * segment_size * ds_factor)
    if t2 > recording0.get_num_frames():
        t2 = int(recording0.get_num_frames() / ds_factor) * ds_factor
    traces = recording0.get_traces(
        start_frame=t1,
        end_frame=t2
    )
    M = traces.shape[0]
    N = traces.shape[1]
    if ds_factor > 1:
        N2 = int(N / ds_factor)
        traces_reshaped = traces.reshape((M, N2, ds_factor))
        traces_min = np.min(traces_reshaped, axis=2)
        traces_max = np.max(traces_reshaped, axis=2)
        traces = np.zeros((M, N2 * 2), dtype=np.float32)
        traces[:, 0::2] = traces_min
        traces[:, 1::2] = traces_max
    
    return {
        'traces': traces.astype(np.float32)
    }
    # data_b64 = _mda32_to_base64(traces)
    # # elapsed = time.time() - timer
    # return dict(
    #     data_b64=data_b64
    # )

# def _mda32_to_base64(X) -> str:
#     f = io.BytesIO()
#     le.writemda32(X, f)
#     return base64.b64encode(f.getvalue()).decode('utf-8')
