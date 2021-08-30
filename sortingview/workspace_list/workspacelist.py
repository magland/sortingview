import kachery_client as kc
from sortingview.workspace import Workspace
from ..workspace import Workspace

# Obsolete, but needed for now for the migration script to work
class WorkspaceList:
    def __init__(self, *, list_name: str):
        print(f'WARNING: WorkspaceList is obsolete (except when migrating to new system). Instead, use get_workspace_list(), set_workspace_list(), and add_workspace_to_list().')
        self._list_name = list_name
        self._workspaces = {}
        sf = kc.load_subfeed(self.get_subfeed_uri())
        messages = sf.get_next_messages()
        for m in messages:
            a = m.get('action', {})
            type0 = a.get('type', None)
            if type0 == 'add':
                w = a.get('workspace')
                self._workspaces[w['name']] = w
            elif type0 == 'remove':
                name = a.get('workspaceName')
                if name in self._workspaces:
                    del self._workspaces[name]
    @property
    def workspace_names(self):
        return [name for name in list(self._workspaces.keys())]
    def get_workspace(self, name):
        w = self._workspaces[name]
        return Workspace(workspace_uri=w['uri'], label=w['name'])
    def add_workspace(self, *, name: str, workspace: Workspace):
        if name in self.workspace_names:
            raise Exception(f'Workspace with name already exists: {name}')
        sf = kc.load_subfeed(self.get_subfeed_uri())
        w = {
            'name': name,
            'uri': workspace.uri
        }
        sf.append_message({
            'action': {
                'type': 'add',
                'workspace': w
            }
        })
        self._workspaces[name] = w
    def remove_workspace(self, name: str):
        if name not in self.workspace_names:
            raise Exception(f'Workspace not found: {name}')
        sf = kc.load_subfeed(self.get_subfeed_uri())
        sf.append_message({
            'action': {
                'type': 'remove',
                'workspaceName': name
            }
        })
        del self._workspaces[name]
    def get_subfeed_uri(self):
        k = {'name': 'sortingview-workspace-list'}
        feed_uri = kc.get(k)
        if feed_uri is None:
            feed_uri = kc.create_feed().uri
            kc.set(k, feed_uri)
        f = kc.load_feed(feed_uri)
        return f.load_subfeed(self._list_name).uri