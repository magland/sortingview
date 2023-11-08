from typing import List, Union
from .View import View
from .Image import _form_data_url
import kachery_cloud as kcl


class UnitImagesItem:
    """
    Single unit image
    """

    def __init__(self, unit_id: Union[int, str], figure, dpi: int) -> None:
        self.unit_id = unit_id
        with kcl.TemporaryDirectory() as tmpdir:
            fname = f"{tmpdir}/image.jpg"
            figure.savefig(fname, dpi=dpi)
            self.url = _form_data_url(fname)

    def to_dict(self):
        ret = {"unitId": self.unit_id, "url": self.url}
        return ret


class UnitImages(View):
    """
    Unit images view
    """

    def __init__(self, items: List[UnitImagesItem], item_width: float, item_height: float, **kwargs) -> None:
        super().__init__("UnitImages", **kwargs)
        self._items = items
        self._item_width = item_width
        self._item_height = item_height

    def to_dict(self) -> dict:
        ret = {"type": self.type, "items": [a.to_dict() for a in self._items], "itemWidth": self._item_width, "itemHeight": self._item_height}
        return ret

    def child_views(self) -> List[View]:
        return []
