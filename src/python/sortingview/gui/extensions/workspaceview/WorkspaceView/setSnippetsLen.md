## Set workspace snippets length

To set snippets length for a workspace

```python
import sortingview as sv

workspace_uri = '{workspaceUri}'
snippets_len = # (50, 80) - (num. timepoints before peak, num. timepoints after peak)

W = sv.load_workspace(workspace_uri)
W.set_snippets_len(snippets_len)

print(f'Snippets length for workspace set to: {W.snippets_len}')
```