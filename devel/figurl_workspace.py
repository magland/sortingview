import sortingview as sv

workspace_uri = 'workspace://acf9d87b54e5daefbf1a6797bdaf5e1faee4834372e6704bdfdd78ed34353ca3'
workspace = sv.Workspace(workspace_uri=workspace_uri)
url = workspace.figurl().url()
print(url)
