import kachery_client as kc
import labbox_ephys as le
from ..workspace import Workspace

class WorkspaceList:
    def __init__(self, *, list_name: str):
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
        return [name for name in self._workspaces.keys()]
    def get_workspace(self, name):
        w = self._workspaces[name]
        return Workspace(w['uri'])
    def add_workspace(self, *, name: str, workspace: le.Workspace):
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