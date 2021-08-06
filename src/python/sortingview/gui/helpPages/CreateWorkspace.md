# Creating a new sortingview workspace

To create a new workspace with a single recording/sorting pair, run the following Python script on the computer where the backend service is running. This will print a URL that you can open in your browser.

```python
import numpy as np
import sortingview as sv
import spikeextractors as se

# replace "new-workspace" with the label of the new workspace
new_workspace_label = # 'new-workspace'

workspace = sv.create_workspace(label=new_workspace_label)
channel = '{channel}'
base_url = '{baseUrl}'

# simulate a recording/sorting pair
duration_sec = 50 # duration of simulated recording
num_channels = 8 # num. channels in simulated recording
num_units = 5 # num units
seed = 2 # random number generator seed

def prepare_recording_sorting():
    # Simulate a recording (toy example)
    recording, sorting = se.example_datasets.toy_example(duration=duration_sec, num_channels=num_channels, K=num_units, seed=seed)
    R = sv.LabboxEphysRecordingExtractor.from_memory(recording, serialize=True, serialize_dtype=np.int16)
    S = sv.LabboxEphysSortingExtractor.from_memory(sorting, serialize=True)
    return R, S

recording, sorting_true = prepare_recording_sorting()
recording_label = 'simulation'
sorting_label = 'true'
print(f'Workspace URI: {workspace.uri}')
R_id = workspace.add_recording(recording=recording, label=recording_label)
S_id = workspace.add_sorting(sorting=sorting_true, recording_id=R_id, label=sorting_label)

print(workspace.figurl(channel=channel, base_url=base_url))
```