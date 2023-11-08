from typing import List, Union
import base64
from .View import View


class Image(View):
    """
    Image
    """

    def __init__(self, *, url: Union[str, None] = None, image_path: Union[str, None] = None, **kwargs) -> None:
        super().__init__("Image", **kwargs)
        if image_path is not None:
            if url is not None:
                raise Exception("Cannot specify both url and image_path")
            url = _form_data_url(image_path)
        else:
            if url is None:
                raise Exception("Must specify either url or image_path")
        self._url = url

    def to_dict(self) -> dict:
        ret = {"type": self.type, "url": self._url}
        return ret

    def child_views(self) -> List[View]:
        return []


def _form_data_url(path: str):
    if path.endswith(".jpg") or path.endswith(".jpeg"):
        prefix = "data:image/jpeg;base64,"
    elif path.endswith(".png"):
        prefix = "data:image/png;base64,"
    else:
        raise Exception(f"Unrecognized image type: {path}")
    with open(path, "rb") as f:
        data_b64 = base64.b64encode(f.read()).decode("ascii")
        return f"{prefix}{data_b64}"
