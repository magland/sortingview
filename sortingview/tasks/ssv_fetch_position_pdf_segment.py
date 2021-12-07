import numpy as np
import kachery_client as kc
import hither2 as hi
from sortingview.config import job_cache, job_handler
from sortingview.serialize_wrapper import serialize_wrapper
import xarray as xr
import kachery_client as kc

@hi.function(
    'spikesortingview_fetch_position_pdf_segment', '0.1.0'
)
@serialize_wrapper
def spikesortingview_fetch_position_pdf_segment(*, pdf_object: dict, segment_number: int, segment_size: int, downsample_factor: int):
    uri = pdf_object['uri']
    fname = kc.load_file(uri)
    X = xr.open_dataset(fname)
    try:
        num_times = X.acausal_posterior.shape[0]
        num_positions = X.acausal_posterior.shape[2]
        chunk_size = int(np.floor(100000 / downsample_factor))
        num_chunks = int(np.ceil(segment_size / chunk_size))
        ret = np.zeros((segment_size, num_positions), dtype=np.uint8)
        for ic in range(num_chunks):
            j1 = segment_number * segment_size + ic * chunk_size
            j2 = min(j1 + chunk_size, segment_number * segment_size + segment_size)
            j2 = min(j2, int(np.floor(num_times / downsample_factor)))
            i1 = j1 * downsample_factor
            i2 = j2 * downsample_factor
            A = X.acausal_posterior.isel(time=slice(i1, i2)).sum('state').values
            A = np.reshape(A, (j2 - j1, downsample_factor, A.shape[1]))
            A = np.sum(A, axis=1)
            B = A / np.reshape(np.repeat(np.max(A, axis=1), num_positions), A.shape)
            B = (B * 100).astype(np.uint8)
            ret[j1 - segment_number * segment_size:j2 - segment_number * segment_size] = B
        return ret
    finally:
        X.close()

@kc.taskfunction('spikesortingview.fetch_position_pdf_segment.1', type='pure-calculation')
def task_fetch_position_pdf_segment(*, pdf_object: dict, segment_number: int, segment_size: int, downsample_factor: int):
    with hi.Config(job_handler=job_handler.misc, job_cache=job_cache):
        return hi.Job(spikesortingview_fetch_position_pdf_segment, {'pdf_object': pdf_object, 'segment_number': segment_number, 'segment_size': segment_size, 'downsample_factor': downsample_factor})