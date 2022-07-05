from abc import abstractmethod
from typing import List, Union
import kachery_cloud as kcl
import figurl as fig
import uuid


class View:
    """
    Base class for all views
    """
    def __init__(self, view_type: str, *, is_layout: bool=False) -> None:
        self.type = view_type
        self.id = _random_id()
        self.is_layout = is_layout
    @abstractmethod
    def to_dict(self) -> dict:
        return {}
    @abstractmethod
    def child_views(self) -> List['View']:
        return []
    def get_descendant_views_including_self(self):
        ret: List[View] = [self]
        for ch in self.child_views():
            a = ch.get_descendant_views_including_self()
            for v in a:
                ret.append(v)
        return ret
    def url(self, *, label: str, sorting_curation_uri: Union[None, str]=None):
        from .Box import Box
        from .LayoutItem import LayoutItem
        if self.is_layout:
            all_views = self.get_descendant_views_including_self()
            data = {
                'type': 'SortingLayout',
                'layout': self.to_dict(),
                'views': [
                    {
                        'type': view.type,
                        'viewId': view.id,
                        'dataUri': _upload_data_and_return_uri(view.to_dict())
                    }
                    for view in all_views if not view.is_layout
                ]
            }
            if sorting_curation_uri is not None:
                data['sortingCurationUri'] = sorting_curation_uri
                project_id = kcl.get_project_id()
            else:
                project_id = None
            F = fig.Figure(view_url='gs://figurl/spikesortingview-6', data=data)
            url = F.url(label=label, project_id=project_id)
            return url

        # Need to wrap it in a layout
        V = Box(
            direction='horizontal',
            items=[
                LayoutItem(self)
            ]
        )
        assert V.is_layout # avoid infinite recursion
        return V.url(label=label, sorting_curation_uri=sorting_curation_uri)

def _upload_data_and_return_uri(data):
    return kcl.store_json(fig.serialize_data(data))

def _random_id():
    return str(uuid.uuid4())[-12:]
