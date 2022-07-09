# %%
# imports

import sortingview as sv
import spikeinterface.extractors as se
import kachery_cloud as kcl
# %%
# Define SpikeInterface extractors for a recording/sorting pair
# See: https://spikeinterface.readthedocs.io/en/latest/
recording, sorting = se.toy_example(num_units=10, duration=120, seed=0)

# Note that only some recording/sorting extractors are supported by sortingview
# Here is how we create copies of the extractors that are compatible with sortingview
R = sv.copy_recording_extractor(recording=recording, serialize_dtype='float32')
S = sv.copy_sorting_extractor(sorting=sorting)
# %%
# Create a sortingview workspace and add the recording/sorting
W: sv.Workspace = sv.create_workspace(label='example')
recording_id = W.add_recording(label='recording1', recording=R)
sorting_id = W.add_sorting(recording_id=recording_id, label='true', sorting=S)

# Print the workspace URI
# This can be used to load the workspace at a later time
print(f'Workspace URI: {W.uri}')
# %%
# Save the workspace URI in a local mutable
# so it can be retrieved in the other notebooks
kcl.set_mutable_local('sortingview-workspace-example-uri', W.uri)