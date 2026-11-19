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

## Publishing to figpack instead of figurl (experimental)

Existing code that calls `view.url(...)` (for example spyglass) can publish to [figpack](https://github.com/flatironinstitute/figpack) without code changes:

```bash
pip install "sortingview[figpack]"
export SORTINGVIEW_BACKEND=figpack
export FIGPACK_API_KEY=...      # your figpack API key
export FIGPACK_BUCKET=...       # optional: a bucket whose figures do not expire
```

`view.url(...)` then returns a figpack figure URL. If the view tree contains a view with no figpack equivalent, sortingview warns and falls back to figurl (set `SORTINGVIEW_FIGPACK_STRICT=1` to raise instead). A starting curation passed as `state={"sortingCuration": uri}` is loaded into the figpack figure, and `sortingview.figpack_backend.load_curation(figure_url)` reads the saved curation back. Set `SORTINGVIEW_FIGPACK_MODE=local` to write the figure to a local folder instead of uploading, or `ephemeral` for a temporary upload that needs no API key.
