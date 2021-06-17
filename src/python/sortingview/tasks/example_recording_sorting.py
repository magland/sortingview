from numpy.core.records import record
import spikeextractors as se
import numpy as np
import labbox_ephys as le
import hither2 as hi
import kachery_client as kc
from sortingview.config import job_cache, job_handler

# adjust these values
workspace_uri = '{workspaceUri}'
recording_label = 'simulated_recording'
duration_sec = 60 # duration of simulated recording
num_channels = 8 # num. channels in simulated recording
num_units = 5 # num units
seed = 1 # random number generator seed

def prepare_recording_sorting():
    # Simulate a recording (toy example)
    recording, sorting = se.example_datasets.toy_example(duration=duration_sec, num_channels=num_channels, K=num_units, seed=seed)
    R = le.LabboxEphysRecordingExtractor.from_memory(recording, serialize=True, serialize_dtype=np.int16)
    S = le.LabboxEphysSortingExtractor.from_memory(sorting, serialize=True)
    return R, S


@hi.function('example_recording_sortings', '0.1.2')
def example_recording_sortings():
    recording, sorting_true = prepare_recording_sorting()
    recording_uri = kc.store_json(recording.object(), basename='example_recording.json')
    sorting_uri = kc.store_json(sorting_true.object(), basename='example_sorting_true.json')
    return [{
        'label': 'Simulation1',
        'recordingObject': recording.object(),
        'recordingUri': recording_uri,
        'sortingObject': sorting_true.object(),
        'sortingUri': sorting_uri
    }]


@kc.taskfunction('example_recording_sortings', type='pure-calculation')
def task_example_recording_sortings(cachebust: str):
    with hi.Config(job_handler=job_handler.misc, job_cache=job_cache):
        return hi.Job(example_recording_sortings, {})