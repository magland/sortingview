## Set workspace permissions

To set workspace permissions for a user, run the following script on the backend computer

```python
import sortingview as sv

workspace_uri = '<|WORKSPACE_URI|>'
user_id = # '<|USER|>'
permissions = {'edit': True}

W = sv.load_workspace(workspace_uri)

W.set_user_permissions(user_id, permissions)

print(f'Permissions for {user_id} set to: {W.get_user_permissions(user_id)}')
```
