import kachery_p2p as kp
import labbox_ephys as le

class WorkspaceList:
    def __init__(self, backend_uri: str):
        self._backend_uri = backend_uri
    def add_workspace(self, *, name: str, workspace: le.Workspace):
        sf = kp.load_subfeed(self.get_subfeed_uri())
        sf.append_message({
            'action': {
                'type': 'add',
                'workspace': {
                    'name': name,
                    'uri': workspace.uri
                }
            }
        })
    def get_subfeed_uri(self):
        k = {'name': 'sortingview-workspace-list', 'backendUri': self._backend_uri}
        feed_uri = kp.get(k)
        if feed_uri is None:
            feed_uri = kp.create_feed().get_uri()
            kp.set(k, feed_uri)
        f = kp.load_feed(feed_uri)
        return f.get_subfeed('workspace-list').get_uri()