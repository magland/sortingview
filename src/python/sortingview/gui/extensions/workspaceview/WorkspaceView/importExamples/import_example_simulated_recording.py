import spikeextractors as se
import numpy as np
import labbox_ephys as le
import kachery_p2p as kp

# adjust these values
workspace_uri = '{workspaceUri}'
recording_label = 'simulated_recording'
duration_sec = 50 # duration of simulated recording
num_channels = 8 # num. channels in simulated recording
num_units = 5 # num units
seed = 1 # random number generator seed

def prepare_recording_sorting():
    # Simulate a recording (toy example)
    recording, sorting = se.example_datasets.toy_example(duration=duration_sec, num_channels=num_channels, K=num_units, seed=seed)
    R = le.LabboxEphysRecordingExtractor.from_memory(recording, serialize=True, serialize_dtype=np.int16)
    S = le.LabboxEphysSortingExtractor.from_memory(sorting, serialize=True)
    return R, S

recording, sorting_true = prepare_recording_sorting()
sorting_label = 'true'
workspace = le.load_workspace(workspace_uri)
print(f'Workspace URI: {workspace.get_uri()}')
R_id = workspace.add_recording(recording=recording, label=recording_label)
S_id = workspace.add_sorting(sorting=sorting_true, recording_id=R_id, label=sorting_label)