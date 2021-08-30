import hither2 as hi
import kachery_client as kc
import numpy as np
from sortingview.config import job_cache, job_handler
from sortingview.helpers import prepare_snippets_h5


@hi.function(
    'get_peak_channels', '0.1.0',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['sortingview']
)
def get_peak_channels(snippets_h5):
    import h5py
    h5_path = kc.load_file(snippets_h5)
    assert h5_path is not None
    ret = {}
    with h5py.File(h5_path, 'r') as f:
        unit_ids = np.array(f.get('unit_ids'))
        for unit_id in unit_ids:
            unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms')) # n x M x T
            channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids')) # n
            peak_channel_index = _compute_peak_channel_index_from_waveforms(unit_waveforms)
            ret[str(unit_id)] = int(channel_ids[peak_channel_index])
    return ret

def _compute_peak_channel_index_from_waveforms(waveforms):
    average_waveform = np.mean(waveforms, axis=0)
    channel_amplitudes = (np.max(average_waveform, axis=1) - np.min(average_waveform, axis=1)).squeeze() # M
    peak_channel_index = np.argmax(channel_amplitudes)
    return peak_channel_index

@kc.taskfunction('get_peak_channels.1', type='pure-calculation')
def task_get_peak_channels(sorting_object, recording_object, configuration={}, snippet_len=(50, 80)):
    with hi.Config(
        job_cache=job_cache,
        job_handler=job_handler.metrics
    ):
        with hi.Config(job_handler=job_handler.extract_snippets):
            snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object, snippet_len=snippet_len)
        return get_peak_channels.run(
            snippets_h5=snippets_h5
        )