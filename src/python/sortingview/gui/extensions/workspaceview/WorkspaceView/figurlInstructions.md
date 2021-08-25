## View workspace in figurl

**Prerequisite**: In addition to running the usual sortingview backend, you must also run (in a separate conda environment), the backend from the alpha version of sortingview, which must be explicitly installed via:

```bash
# install in a separate conda environment
pip install sortingview==0.6.2a0
```

Set the following environment variable:

```bash
export FIGURL_CHANNEL="<|CHANNEL|>"
```

Then, to open this workspace in figurl, run the following script in the new conda environment:

```python
import sortingview as sv

workspace_uri = '<|WORKSPACE_URI|>'
label = 'workspace' # update the label if desired

W = sv.load_workspace(workspace_uri)
F = W.figurl()
url = F.url(label=label) 
print(url)
```

Then open the printed link in a browser.
