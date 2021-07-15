To add a workspace, run the following Python script on the computer where the backend service is running:

```python
import sortingview

# replace "new-workspace" with the name of the new workspace
new_workspace_name = # 'new-workspace'

workspace_list = sortingview.WorkspaceList(list_name='default')
new_workspace = sortingview.create_workspace()
workspace_list.add_workspace(name=new_workspace_name, workspace=new_workspace)
```

To remove a workspace:

```python
import sortingview

# replace "new-workspace" with the name of the workspace to remove
workspace_name = # 'new-workspace'

workspace_list = sortingview.WorkspaceList(list_name='default')
workspace_list.remove_workspace(name=workspace_name)
```

To list workspaces:

```python
names = sortingview.workspace_names
print(names)
```

To retrieve a Python workspace object:

```python
W = sortingview.get_workspace(name)
```