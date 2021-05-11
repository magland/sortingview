import sortingview as sv
import labbox_ephys as le

x = []

w = le.load_workspace('default')
x.append({
    'workspaceUri': w.get_uri(),
    'workspaceLabel': 'default'
})

w = le.load_workspace('test1')
x.append({
    'workspaceUri': w.get_uri(),
    'workspaceLabel': 'test1'
})

sv.set_workspace_list(x)