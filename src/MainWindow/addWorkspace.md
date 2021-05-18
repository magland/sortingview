To add a workspace, run the following Python script on the computer where the backend provider is running:

```python
import sortingview
import labbox_ephys as le

# replace "new-workspace" with the name of the new workspace
new_workspace_name = 'new-workspace'

workspace_list = sortingview.WorkspaceList(backend_uri='{backendUri}')
new_workspace = le.create_workspace()
workspace_list.add_workspace(name=new_workspace_name, workspace=new_workspace)
```