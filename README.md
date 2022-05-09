# SortingView

View, curate, and share results of electrophysiological spike sorting in the browser.

## Installation and setup

It is recommended that you use a conda environment with Python >= 3.8 and numpy.

```bash
# clone this repo
git clone https://github.com/magland/sortingview

# checkout this branch
git checkout v2

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

See [examples/example1.py](examples/example1.py)

[View figURL](https://figurl.org/f?v=gs://figurl/spikesortingview-2&d=ipfs://bafkreif3rb4yqpmece62wpfgqgdqc4izjitgs6x3htuqoeonwu6r5pd5ly&project=siojtbyvbw&label=Test%20workspace)

## Reloading a workspace

A workspace can be reloaded from an existing URI. For example:

```python
import sortingview as sv

uri = ...
W = sv.load_workspace(uri)
```

## Creating a copy of a recording/sorting extractor

Only some recording/sorting extractor types are supported by sortingview (see below for the list).
If you have extractors that are not supported, you can create copies
that are compatible:

```python
import sortingview as sv

recording = ...
sorting = ...

R = sv.copy_recording_extractor(recording=recording, serialize_dtype='float32')
S = sv.copy_sorting_extractor(sorting=sorting)
```

## Multi-panel timeseries visualization

See [examples/timeseries_panels.py](examples/timeseries_panels.py)

[View figURL](https://www.figurl.org/f?v=gs://figurl/spikesortingview-2&d=ipfs://bafkreictlxjsm5c35hz5gs4x4z6e3k5wumcqujytabfygjceecfowdx7li&project=siojtbyvbw&label=Jaq_03_12_visualization_data)

## Supported SpikeInterface extractors

The following sorting/recording extractor types are currently supported by sortingview:

* NpzSortingExtractor
* MdaSortingExtractor
* NwbSortingExtractor
* NwbRecordingExtractor
* BinaryRecordingExtractor

If your extractor is not one of these types you can use `copy_*_extractor()` as above to create a copy that is supported, or request support for your extractor.

## Environment

You can use environment variables to control the storage/configuration directory used by kachery-cloud and the project ID used for storing data in the cloud.

```bash
# Set the storage/configuration directory used by kachery-cloud
# If unset, $HOME/.kachery-cloud will be used
# The client ID will be determined by this directory
# You can share the same kachery-cloud directory between multiple users,
# but you will need to set mult-user mode for the client
export KACHERY_CLOUD_DIR="..."

# Set the project ID for storing data in the cloud
# If unset, the default project associated with the client will be used
# The default project can be configured at https://cloud.kacheryhub.org
export KACHERY_CLOUD_PROJECT_ID="..."
```

It is recommend that you set these variables in your `~/.bashrc` file.

## Sharing the kachery cloud directory between multiple users

On a shared system, you may want to share your kachery cloud directory between multiple users so that
they can utilize the same projects, mutables, local files, and task backends. Follow these steps:

* Create a new kachery cloud directory in a location where the users may access it
with read and write permissions. For example, this could be on a shared drive.
* Have each user set the KACHERY_CLOUD_DIR environment variable to point to this
directory on their system (see above)
* Have the main user (the one who will own the client) initiatialize the client as usual via
`kachery-cloud-init`
* Set `multiuser` to `true` in `$KACHERY_CLOUD_DIR/config.yaml`

The last step is necessary so that all files are created with read/write access for
all users.