from typing import Union
import kachery_cloud as kcl
from .load_workspace import load_workspace


def create_workspace(*, label: Union[str, None]):
    feed = kcl.create_feed()
    feed_id = feed.feed_id
    workspace_uri = f'sortingview-workspace:{feed_id}'
    if label is not None:
        workspace_uri = workspace_uri + f'?label={label}'
    return load_workspace(workspace_uri)