To add a workspace, run the following Python script on the computer where the backend service is running:

```python
import sortingview

# replace "new-workspace" with the label of the new workspace
new_workspace_label = # 'new-workspace'

new_workspace = sortingview.create_workspace(label=new_workspace_label)
sortingview.add_workspace_to_list(list_name='default', workspace=new_workspace)

# Then refresh the page on the web app
```