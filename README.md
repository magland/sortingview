# sortingview

Interactively view, curate, and share results of electrophysiological spike sorting.

**This project is at an early stage of development.**

[List of recent changes](./doc/changelog.txt)

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

# optionally supply a backend ID: --backend-id <backend-id-string>
```

## Authors

Jeremy Magland and Jeff Soules, Center for Computational Mathematics, Flatiron Institute

In collaboration with Kyu Hyun Lee and Loren Frank, Frank Laboratory @ UCSF
