# sortingview

Interactively view, curate, and share results of electrophysiological spike sorting.

[Some example views](https://github.com/magland/sortingview/wiki/Example-views)

### Hosting a backend server

A backend service implements the compute tasks needed to power the web GUI on a particular channel.

* Step 1: [Set up and run a kachery node on your computer](https://github.com/kacheryhub/kachery-doc/blob/main/doc/kacheryhub-markdown/hostKacheryNode.md)
* Step 2: [Create a new kachery channel](https://github.com/kacheryhub/kachery-doc/blob/main/doc/kacheryhub-markdown/createKacheryChannel.md) - be sure to authorize your own node as well as the [figurl](https://github.com/magland/figurl) node on this channel
  - Step 2b: Restart the kachery daemon after adding the channel for the changes to take effect
* Step 3: Install and set up sortingview (see below)
* Step 4: Run the sortingview backend (see below)
* Step 5: Create a sortingview workspace and view it using figurl (see below)

## SortingView installation and setup

On the computer running the kachery daemon, install the python package:

```bash
pip install --upgrade sortingview
```

Set the FIGURL_CHANNEL environment variable to the name of the channel you set up on kachery

```bash
# You can put this in your ~/.bashrc
export FIGURL_CHANNEL=<name-of-your-kachery-channel>
```

## Running the SortingView backend

To run the backend service:

```bash
sortingview-start-backend --channel <name-of-kachery-channel>
```

You can optionally specify a backend ID. See below for more details.

### Creating and viewing a SortingView workspace

A sortingview workspace consists of a collection of recordings and optionally one or more sortings of those recordings. Workspaces are created on the computer running the backend using Python scripts and can be visualized from anywhere using a web browser. This [example script](https://github.com/magland/sortingview/blob/main/devel/create_workspace.py) shows how to create a basic workspace using [SpikeInterface](https://github.com/SpikeInterface).

### Using a backend ID

When starting the backend service, you can optionally supply a backend ID, a secret string that can restrict access to the service:

```bash
sortingview-start-backend --channel <name-of-kachery-channel> --backend-id <secret-string>
```

Then, on the front-end, you can connect to your particular backend by setting the backend ID inside the figurl web app (use the channel button in the upper-right corner of the page).

If you are in a multi-user environment, you may want to have each user run their own backend, with different backend IDs. This could particularly work well if each user runs a backend on their own workstation, and all workstations connect to the same kachery daemon, with a shared kachery storage directory mounted on all workstations.

### Task concurrency

See [task concurrency](https://github.com/magland/sortingview/wiki/Task-concurrency)

## Using a recording from the new SpikeInterface

[Wrapping a new SpikeInterface recording into an old-version recording extractor](https://github.com/magland/sortingview/wiki/new-spike-interface-recording)

## Precalculating the extract snippets step from Python

[Workspace precalculation](https://github.com/magland/sortingview/wiki/workspace-precalculation)

## Authors

Jeremy Magland and Jeff Soules, Center for Computational Mathematics, Flatiron Institute

In collaboration with Kyu Hyun Lee and Loren Frank, Frank Laboratory @ UCSF
