To view a sortingview workspace in figurl:

```python
import sortingview as sv

workspace_id = '<workspace-id>' # replace with the workspace id
workspace_uri = f'workspace://{workspace_id}'
label = 'workspace' # update the label if desired

W = sv.load_workspace(workspace_uri)
F = W.figurl()
url = F.url(label=label) 
print(url) # This is the figurl link
```