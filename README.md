# SortingView

View, curate, and share results of electrophysiological spike sorting in the browser, on the desktop, and in the notebook.

[List of examples](./doc/examples.md)

[Table of features](./doc/features.md)

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
export KACHERY_ZONE = "scratch"
```

You can use the scratch zone to get started, but the files in that zone will be cleared out periodically. For more persistent storage (which is also not guaranteed to persist forever), you'll need to set up your own zone.

## Getting started

See the [examples folder](./examples).

For example:

```bash
python examples/example_autocorrelograms.py
```