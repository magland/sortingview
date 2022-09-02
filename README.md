# SortingView

View, curate, and share results of electrophysiological spike sorting in the browser.

[Gallery of examples](./doc/examples.md)

[List of features](./doc/features.md)

## Installation and setup

```bash
pip install --upgrade sortingview
```

If you want to generate shareable URLs, configure your [kachery-cloud](https://github.com/scratchrealm/kachery-cloud) client

```bash
kachery-cloud-init
# follow the instructions to associate your client with your Google user name on kachery-cloud
```

## Getting started

See the [examples folder](./examples) or the [example notebook](./notebooks/sortingview_jupyter.ipynb).

Keep in mind that sortingview widgets can be viewed in any of the following modes:
* shareable URL in the browser
* local URL in the browser
* electron desktop window
* jupyter lab notebook widget

## SpikeInterface Integration

We are working on a tight integration between sortingview and [SpikeInterface](https://spikeinterface.readthedocs.io/en/latest/).

## Running a backend

This is optional. When generating shareable URLs, some visualizations require a running backend. Most do not. Optionally, run the following in a terminal:

```bash
sortingview-start-backend
```

For advanced usage, see [doc/backend.md](doc/backend.md).

## Frank lab usage

See [franklab_usage](./franklab_usage.md)

## Environment

You can use environment variables to control the storage/configuration directory used by kachery-cloud, the project ID used for storing data in the cloud, and the options for creating figures.

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

## Jupyter lab integration

You can also view sortingview widgets directly in a Jupyter lab notebook. As with local and electron modes, no data goes to the cloud, and the front-end simply communicates with the python kernel. It uses the ipywidgets mechanism.

After creating a view, simply use the following command in the notebook cell.

```
view.jupyter(height=800)
```

See [example notebook sortingview_jupyter.ipynb](./notebooks/sortingview_jupyter.ipynb)
