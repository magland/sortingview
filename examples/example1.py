import sortingview as sv
import spikeinterface.extractors as se

# Define SpikeInterface extractors for a recording/sorting pair
# See: https://spikeinterface.readthedocs.io/en/latest/
recording, sorting = se.toy_example(num_units=6, duration=120, seed=0)

# Note that only some recording/sorting extractors are supported by sortingview
# Here is how we create copies of the extractors that are compatible with sortingview
R = sv.copy_recording_extractor(recording=recording, serialize_dtype='float32')
S = sv.copy_sorting_extractor(sorting=sorting)

# Create a sortingview workspace and add the recording/sorting
W: sv.Workspace = sv.create_workspace(label='example')
recording_id = W.add_recording(label='recording1', recording=R)
sorting_id = W.add_sorting(recording_id=recording_id, label='true', sorting=S)

# Print the workspace URI for loading at a later time
# You may want to store this in a database
print(f'Workspace URI: {W.uri}')

# Optionally create a curation feed and set the access permissions
W.create_curation_feed_for_sorting(sorting_id=sorting_id)
W.set_sorting_curation_authorized_users(sorting_id=sorting_id, user_ids=['jmagland@flatironinstitute.org'])

# Prepare a visualization and print the figURL
url2 = W.spikesortingview(recording_id=recording_id, sorting_id=sorting_id, label='Test workspace')
print(url2)

# Click the link to view the visualization in a browser

# Example: https://figurl.org/f?v=gs://figurl/spikesortingview-2&d=ipfs://bafkreif3rb4yqpmece62wpfgqgdqc4izjitgs6x3htuqoeonwu6r5pd5ly&project=siojtbyvbw&label=Test%20workspace
