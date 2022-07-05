# SortingView

View, curate, and share results of electrophysiological spike sorting in the browser.

## Installation and setup

It is recommended that you use a conda environment with Python >= 3.8 and numpy.

```bash
# For now, install by cloning the source
# because only the previous version is
# currently on PyPI. See the section
# below on backward compatibility.

# clone this repo
git clone https://github.com/magland/sortingview

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

See [examples/example2.py](examples/example2.py)

[View figURL](https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://b8c937f982a0308d6a5d8c440b7a01e7cf578447&label=test%20mountain%20layout)

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

See [examples/old_timeseries_panels.py](examples/old_timeseries_panels.py)

[View figURL](https://www.figurl.org/f?v=gs://figurl/spikesortingview-2&d=ipfs://bafkreictlxjsm5c35hz5gs4x4z6e3k5wumcqujytabfygjceecfowdx7li&project=siojtbyvbw&label=Jaq_03_12_visualization_data)

Note: you should instead use the layout method for this. Needs example and documentation.

## Supported SpikeInterface extractors

The following sorting/recording extractor types are currently supported by sortingview:

* NpzSortingExtractor
* MdaSortingExtractor
* NwbSortingExtractor
* NwbRecordingExtractor
* BinaryRecordingExtractor
* ConcatenateSegmentRecording

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

## Backward compatibility

This version of sortingview (`>= 0.8.*`) uses kachery-cloud whereas the previous version (`0.7.*`) used kachery-daemon and kachery-client.
The previous version is on the v1 branch. This version is on the main branch.

These two versions are similar in many ways, but there are differences in the API. The main advantages of the new system are

* Overall simpler package with a more complete documentation and straightforward usage examples
* Does not require running a kachery daemon
* Uses kachery-cloud which is the more robust version of kachery we will use going forward
* Operates directly on SpikeInterface recording/sorting extractors rather than using intermediate LabboxEphys*Extractors

*Can old workspaces be loaded with this new version?*
Old workspaces use feeds that are managed by kachery-daemon whereas new workspaces use feeds in kachery-cloud.
But there is some limited backward compatibility to allow reading of sorting curations from old workspaces.
You can load an old workspace (uri starting with workspace://) using this v2 package and read sorting IDs, recording IDs, sorting extractors, recording extractors, and sorting curations.
You cannot apply any write operations to an old workspace.
Some recording/sorting extractors may still not be loadable from an old workspace, but the plan is to work toward supporting those, as needed.

Note: It is not necessary to run a kachery-daemon for this version of sortingview *unless* you are loading old workspaces in readonly mode as described above.

The sortingview backend programs (sortingview-start-backend) are different between the two versions, but they can run at the same time (from different conda environments) without interfering with one another. Of course, the old backend requires a running kachery-daemon whereas the new daemon does not.

This new version is not yet available on PyPI, but will be soon. You can always install the previous version (`0.7.*`) from PyPI.