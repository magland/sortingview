# SortingView

View, curate, and share results of electrophysiological spike sorting in the browser, on the desktop, and in the notebook.

[List of examples](./doc/examples.md)

[Using layouts](./doc/layouts.md)

## Installation and setup

```bash
pip install --upgrade sortingview
```

## Kachery Setup

In order to use sortingview, you must configure kachery in order to share files on the kachery network.

Visit this site to register and obtain an API key:

https://kachery.vercel.app

Then set the following environment variables

```bash
export KACHERY_API_KEY = "the-api-key"
export KACHERY_ZONE = "default"
```

For information about kachery storage and zones, see:

https://github.com/magland/kachery?tab=readme-ov-file#zones-and-storage

## Getting started

See the [examples folder](./examples).

For example:

```bash
python examples/example_autocorrelograms.py
```