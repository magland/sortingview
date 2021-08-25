import figurl as fig

def figurl_mountainview(*, recording_id: str, sorting_id: str, workspace_uri: str):
    """
    Generate a sortingview url that shows the mountainview page
    """
    data = {
        'workspaceUri': workspace_uri,
        'recordingId': recording_id,
        'sortingId': sorting_id
    }
    return fig.Figure(type='sortingview.mountainview.1', data=data)

url = figurl_mountainview(
    recording_id='R-fa746904d460',
    sorting_id='S-83c498c391ed',
    workspace_uri='workspace://acf9d87b54e5daefbf1a6797bdaf5e1faee4834372e6704bdfdd78ed34353ca3'
).url(label='mountainview')
print(url)
