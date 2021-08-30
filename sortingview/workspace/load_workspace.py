from .workspace import Workspace

def load_workspace(workspace_uri: str):
    return Workspace(workspace_uri=workspace_uri)