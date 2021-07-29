from sortingview import WorkspaceList, set_workspace_list, get_workspace_list

# Run this script once to migrate to new workspace list system

def main():
    # collect the workspaces from the old system
    W = WorkspaceList(list_name='default')
    workspaces = [
        W.get_workspace(workspace_name)
        for workspace_name in W.workspace_names
    ]

    # Assemble new workspace records
    x = [
        {
            'workspaceUri': w.uri,
            'label': w.label,
            'metaData': {} 
        }
        for w in workspaces
    ]

    # Set the new workspace list
    set_workspace_list(x)

    # Print the list
    y = get_workspace_list()
    for w in y:
        print(f"{w['label']}: {w['workspaceUri']}")

if __name__ == '__main__':
    main()