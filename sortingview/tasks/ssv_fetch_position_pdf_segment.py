import h5py
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
def spikesortingview_fetch_position_pdf_segment(*, pdf_object: dict, segment_number: int, downsample_factor: int):
    format0 = pdf_object['format']
    if format0 == 'position_pdf_h5_v1':
        uri = pdf_object['uri']
        fname = kc.load_file(uri)
        with h5py.File(fname, 'r') as f:
            return np.array(f.get(f'segment/{downsample_factor}/{segment_number}'))
    else:
        raise Exception(f'Unexpected format: {format0}')

@kc.taskfunction('spikesortingview.fetch_position_pdf_segment.1', type='pure-calculation')
def task_fetch_position_pdf_segment(*, pdf_object: dict, segment_number: int, downsample_factor: int):
    with hi.Config(job_handler=job_handler.misc, job_cache=job_cache):
        return hi.Job(spikesortingview_fetch_position_pdf_segment, {'pdf_object': pdf_object, 'segment_number': segment_number, 'downsample_factor': downsample_factor})