import kachery_client as kc

def figurl_mountainview(*, channel: str, recording_id: str, sorting_id: str, workspace_uri: str):
    """
    Generate a sortingview url that shows the mountainview page
    """
    base_url = 'http://localhost:3000'
    object_uri = kc.store_json({
        'type': 'sortingview.mountainview.1',
        'data': {
            'workspaceUri': workspace_uri,
            'recordingId': recording_id,
            'sortingId': sorting_id
        }
    })
    object_hash = object_uri.split('/')[2]
    url = f'{base_url}/fig?channel={channel}&figureObject={object_hash}'
    return url

url = figurl_mountainview(
    channel='ccm',
    recording_id='R-fa746904d460',
    sorting_id='S-83c498c391ed',
    workspace_uri='workspace://acf9d87b54e5daefbf1a6797bdaf5e1faee4834372e6704bdfdd78ed34353ca3'
)
print(url)
