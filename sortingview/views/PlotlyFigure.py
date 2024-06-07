from typing import List
from .View import View


class PlotlyFigure(View):
    """
    Image
    """

    def __init__(self, *, fig, **kwargs) -> None:
        super().__init__("PlotlyFigure", **kwargs)
        self._fig = fig

    def to_dict(self) -> dict:
        x = self._fig.to_dict()
        ret = {"type": self.type, "fig": x}
        return ret

    def child_views(self) -> List[View]:
        return []
