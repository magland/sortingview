# SortingView

View, curate, and share results of electrophysiological spike sorting in the browser.

[Gallery of examples](./doc/examples.md)

## Installation and setup

```bash
pip install --upgrade sortingview
```

Configure your [kachery-cloud](https://github.com/scratchrealm/kachery-cloud) client

```bash
kachery-cloud-init
# follow the instructions to associate your client with your Google user name on kachery-cloud
```

## Running a backend

Some visualizations require a running backend. Most do not. Optionally, run the following in a terminal:

```bash
sortingview-start-backend
```

For advanced usage, see [doc/backend.md](doc/backend.md).

## Visualizing a recording/sorting pair

See [examples/example2.py](examples/old/example2.py)

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

# When using local mode for figURLs, data will not be uploaded/downloaded
# from the cloud, and the URLs will not be shareable.
# As an alternative to using the env variable, you can also use
# local=True as an argument to .url() in all of the views.
# See below for more information.
export SORTINGVIEW_LOCAL=1

# Electron mode is similar to local mode, except instead of returning
# a URL, an electron window will open and data will be accessed directly
# from the file system. I.e., no browser.
# This requires installation of figurl-electron (see below).
# See below for more information.
export SORTINGVIEW_ELECTRON=1 # Requires installation of figurl-electron
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

## Local mode

**Note**: you may want to use electron mode instead. See below.

In local mode, data will not be uploaded/downloaded from the cloud, and the URLs will not be shareable.

To use local mode you either set the `SORTINGVIEW_LOCAL` env variable to `1` as shown above,
or you can pass `local=True` as an argument to `.url()` in any of the views.

To use local mode, the browser must be on the same computer as the local kachery-cloud
directory. Upon opening the URL, the user will be prompted to select the kachery-cloud
directory and give the browser permission to read from it. Note that if the directory
starts with [dot], then you will need to show hidden files in the directory selection
dialog box.

This has only been tested in Chrome and probably does not work in Firefox.

## Electron mode

Electron mode is similar to local mode, except instead of returning
a URL, an electron window will open and data will be accessed directly
from the file system.

This requires installation of figurl-electron. On Linux you can use snap.

```bash
# Install figurl-electron on Linux
snap install --edge --devmode figurl-electron
```

To use electron mode you either set the `SORTINGVIEW_ELECTRON` env variable to `1` as shown above,
or you can call `.electron(label='...')` instead of `.url(...)` on any of the views.

## Backward compatibility

This version of sortingview (`>= 0.8.*`) uses kachery-cloud whereas the previous version (`0.7.*`) used kachery-daemon and kachery-client.
The previous version is on the v1 branch. This version is on the main branch.
