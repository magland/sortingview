# SortingView

View, curate, and share results of electrophysiological spike sorting in the browser.

## Installation and setup

It is recommended that you use a conda environment with Python >= 3.8 and numpy.

```bash
git clone <this-repo>
cd sortingview
pip install -e .
```

Configure your [kachery-cloud](https://github.com/scratchrealm/kachery-cloud) client

```bash
kachery-cloud-init
# follow the instructions to associate your client with your Google user name on kachery-cloud
```

## Running a backend

Some visualizations require a running backend. Run the following in a terminal:

```bash
sortingview-start-backend
```

For advanced usage, see [doc/backend.md](doc/backend.md).

## Visualizing a recording/sorting pair

```python
import sortingview as sv

# Define SpikeInterface extractors for a recording/sorting pair
# See: https://spikeinterface.readthedocs.io/en/latest/
# Note that only some recording/sorting extractor types are supported by sortingview
# See below for how to create a copy of a recording/sorting extractor to be
# compatible with sortingview.
recording = ...
sorting = ...

# Create a sortingview workspace and add the recording/sorting
W: sv.Workspace = sv.create_workspace(label='example')
recording_id = W.add_recording(label='recording1', recording=recording)
sorting_id = W.add_sorting(recording_id=recording_id, label='true', sorting=sorting)

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
```

Here is an [example output view](https://figurl.org/f?v=gs://figurl/spikesortingview-2&d=ipfs://bafkreif3rb4yqpmece62wpfgqgdqc4izjitgs6x3htuqoeonwu6r5pd5ly&project=siojtbyvbw&label=Test%20workspace).

See also [these examples](./examples/).

## Reloading a workspace

A workspace can be reloaded from an existing URI. For example:

```python
import sortingview as sv

uri = ...
W = sv.load_workspace(uri)
```

## Creating a copy of a recording/sorting extractor

Only some recording/sorting extractor types are supported by sortingview.
If you have extractors that are not supported, you can create copies
that are compatible:

```python
import sortingview as sv

recording = ...
sorting = ...

R = sv.copy_recording_extractor(recording=recording, serialize_dtype='float32')
S = sv.copy_sorting_extractor(sorting=sorting)
```

## Environment

You can use environment variables to control the storage/configuration directory used by kachery-cloud and the project ID used for storing data in the cloud.

```bash
# Set the storage/configuration directory used by kachery-cloud
# If unset, $HOME/.kachery-cloud will be used
# The client ID will be determined by this directory
# You can share the same kachery-cloud directory between multiple users,
# but they must all have read/write privileges
export KACHERY_CLOUD_DIR="..."

# Set the project ID for storing data in the cloud
# If unset, the default project associated with the client will be used
# The default project can be configured at https://cloud.kacheryhub.org
export KACHERY_CLOUD_PROJECT_ID="..."
```