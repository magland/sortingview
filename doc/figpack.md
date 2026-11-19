# Publishing to figpack instead of figurl

Since 0.15.0, sortingview can publish figures to [figpack](https://github.com/flatironinstitute/figpack) instead of figurl. Code that calls `view.url(...)`, including spyglass, needs no changes: with the settings below, `.url()` returns a figpack figure URL.

## Setup

```bash
pip install -U "sortingview[figpack]"
```

Set these wherever you run your code (shell profile, `.env`, or the top of a notebook):

```bash
export SORTINGVIEW_BACKEND=figpack
export FIGPACK_API_KEY=<your key>
export FIGPACK_BUCKET=<your lab's bucket>   # e.g. gillespielab
```

- Your API key is on your profile at https://manage.figpack.org.
- Uploads to a lab bucket only work if you are on that bucket's list of authorized users. Ask the bucket's owner to add you.
- Use a bucket whose figures do not expire if the URLs will be stored (as spyglass does).

For the Frank Lab track animation and the 1D decoded position views, also run:

```bash
figpack extensions install figpack_franklab figpack_experimental
```

## Behavior

- Figures that used to produce a figurl URL now produce a figpack URL. Existing figurl links keep working.
- If a figure contains a view that figpack can't show yet, sortingview warns and publishes it to figurl as before. Set `SORTINGVIEW_FIGPACK_STRICT=1` to raise an error instead.
- To go back to figurl, unset `SORTINGVIEW_BACKEND`.
- For testing, `SORTINGVIEW_FIGPACK_MODE=local` writes the figure to a local folder, and `ephemeral` makes a temporary upload that needs no API key.

## Manual curation (spyglass)

1. Open the figure from `FigURLCuration` and click "Curate Figure" at the bottom. Labels and merges are saved with the figure. The starting curation from `FigURLCurationSelection` is already loaded.
2. Only the person whose API key created the figure can save its curation, so whoever runs `populate()` should do the curating.
3. Read the curation back by passing the figure URL where you used to pass the `gh://` URI:

   ```python
   url = (sgs.FigURLCuration & key).fetch1("url")
   labels = sgs.FigURLCuration.get_labels(url)
   merge_groups = sgs.FigURLCuration.get_merge_groups(url)
   ```

   This needs [LorenFrankLab/spyglass#1728](https://github.com/LorenFrankLab/spyglass/pull/1728). Until it is merged, use:

   ```python
   from sortingview.figpack_backend import load_curation

   cur = load_curation(url)
   labels = {int(u): l for u, l in cur.get("labelsByUnit", {}).items()}
   merge_groups = cur.get("mergeGroups", [])
   ```

   Then pass `labels` and `merge_groups` to `CurationV1.insert_curation` as usual.

Outside spyglass, a starting curation passed as `state={"sortingCuration": uri}` to `.url()` is loaded into the figure, and `load_curation(figure_url)` returns the saved curation (`labelsByUnit`, `mergeGroups`).
