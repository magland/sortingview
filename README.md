# sortingview

Interactively view, curate, and share results of electrophysiological spike sorting.

**This project is at an early stage of development.**

### Hosting a backend server

A backend server implements the compute tasks needed to power the web GUI on a particular channel.

You must first host a kachery node by [running a kachery daemon](https://kacheryhub.org) on the computer where the backend will be running.

Next, create a new kachery channel and give your node permission to provide tasks on that channel.

On the computer running the kachery daemon, install the python project:

```bash
pip install --upgrade sortingview
```

and run the backend service:

```bash
sortingview-start-backend --channel <name-of-kachery-channel>
```

### Using a backend ID

When starting the backend service, you can optionally supply a backend ID, a secret string that can restrict access to the service:

```bash
sortingview-start-backend --channel <name-of-kachery-channel> --backend-id <secret-string>
```

Then, on the front-end, you can connect to your particular backend by setting the backend ID inside the figurl web app (use the channel button in the upper-right corner of the page).

If you are in a multi-user environment, you may want to have each user run their own backend, with different backend IDs. This could particularly work well if each user runs a backend on their own workstation, and all workstations connect to the same kachery daemon, with a shared kachery storage directory mounted on all workstations.

## Authors

Jeremy Magland and Jeff Soules, Center for Computational Mathematics, Flatiron Institute

In collaboration with Kyu Hyun Lee and Loren Frank, Frank Laboratory @ UCSF
