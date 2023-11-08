# SortingView

View, curate, and share results of electrophysiological spike sorting in the browser, on the desktop, and in the notebook.

[List of examples](./doc/examples.md)

[Table of features](./doc/features.md)

[Using layouts](./doc/layouts.md)

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

SortingView widgets can be viewed in any of the following modes:
* shareable URL in the browser
* [jupyter widget](./doc/jupyter_integration.md) (probably not working - needs to be updated)

## SpikeInterface Integration

We are working on a tight integration between SortingView and [SpikeInterface](https://spikeinterface.readthedocs.io/en/latest/).

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
they can utilize the same local files. Follow these steps:

* Create a new kachery cloud directory in a location where the users may access it
with read and write permissions. For example, this could be on a shared drive.
* Have each user set the KACHERY_CLOUD_DIR environment variable to point to this
directory on their system (see above)
* Have the main user (the one who will own the client) initialize the client as usual via
`kachery-cloud-init`
* Here's the tricky part. You must configure your system such that newly created files in the directory are readable and writeable by all the users with access. This is probably best accomplished using group permissions.
