## Set workspace snippets length

To set snippets length for a workspace

```python
import sortingview as sv

workspace_uri = '<|WORKSPACE_URI|>'
snippet_len = # (50, 80) - (num. timepoints before peak, num. timepoints after peak)

W = sv.load_workspace(workspace_uri)
W.set_snippet_len(snippet_len)

print(f'Snippets length for workspace set to: {W.snippet_len}')
```
