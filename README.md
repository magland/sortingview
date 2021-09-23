# sortingview

Interactively view, curate, and share results of electrophysiological spike sorting.

**This project is at an early stage of development.**

### Hosting a backend server

A backend server implements the compute tasks needed to power the web GUI on a particular channel.

You must first host a kachery node by [running a kachery daemon](https://github.com/kacheryhub/kachery-doc/blob/main/doc/kacheryhub-markdown/hostKacheryNode.md) on the computer where the backend will be running.

Next, create a new kachery channel and give your node permission to provide tasks on that channel.

On the computer running the kachery daemon, install the python project:

```bash
pip install --upgrade sortingview
```

and run the backend service:

```bash
sortingview-start-backend --channel <name-of-kachery-channel>
```

### Creating and viewing a sortingview workspace

A sortingview workspace consists of a collection of recordings and optionally one or more sortings of those recordings. Workspaces are created on the computer running the backend using Python scripts and can be visualized from anywhere using a web browser. This [example script](https://github.com/magland/sortingview/blob/main/devel/create_workspace.py) shows how to create a basic workspace using [SpikeInterface](https://github.com/SpikeInterface).


### Using a backend ID

When starting the backend service, you can optionally supply a backend ID, a secret string that can restrict access to the service:

```bash
sortingview-start-backend --channel <name-of-kachery-channel> --backend-id <secret-string>
```

Then, on the front-end, you can connect to your particular backend by setting the backend ID inside the figurl web app (use the channel button in the upper-right corner of the page).

If you are in a multi-user environment, you may want to have each user run their own backend, with different backend IDs. This could particularly work well if each user runs a backend on their own workstation, and all workstations connect to the same kachery daemon, with a shared kachery storage directory mounted on all workstations.

### Task concurrency

By default, sortingview will run 4 tasks at a time of various types. That is, it will calculate 4 correlograms at a time in parallel, 4 average waveforms in parallel, etc. To override the defaults, create a .yaml file somewhere on your computer and set the SORTINGVIEW_JOB_HANDLER_CONFIG environment variable to the full path of that file prior to running the backend.

```bash
export SORTINGVIEW_JOB_HANDLER_CONFIG=<path-to-yaml-file>
```

Example contents of this configuration file (which could be named `sortingview.yaml`):

```yaml
job_handlers:
  clusters:
    params:
      num_workers: 4
    type: parallel
  correlograms:
    params:
      num_workers: 4
    type: parallel
  extract_snippets:
    params:
      num_workers: 4
    type: parallel
  metrics:
    params:
      num_workers: 4
    type: parallel
  misc:
    params:
      num_workers: 4
    type: parallel
  timeseries:
    params:
      num_workers: 4
    type: parallel
  waveforms:
    params:
      num_workers: 4
    type: parallel
```

## Authors

Jeremy Magland and Jeff Soules, Center for Computational Mathematics, Flatiron Institute

In collaboration with Kyu Hyun Lee and Loren Frank, Frank Laboratory @ UCSF
