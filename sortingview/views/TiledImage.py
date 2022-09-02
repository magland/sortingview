from concurrent.futures import ThreadPoolExecutor
import os
from typing import Any, List, Union
import numpy as np
import kachery_cloud as kcl
from .View import View


class TiledImageLayer:
    def __init__(self, label: str, data: Union[np.array, Any]) -> None:
        import pyvips
        self.label = label
        self.data=data
        if isinstance(data, pyvips.Image):
            image: pyvips.Image = data
        else:
            assert data.dtype == np.uint8, 'Data must be of type uint8'
            image: pyvips.Image = pyvips.Image.new_from_array(data)
        self.image = image


class TiledImage(View):
    def __init__(self, *, tile_size: int, layers: List[TiledImageLayer], **kwargs) -> None:
        super().__init__('TiledImage', **kwargs)
        self._tile_size = tile_size
        self._layers = layers

    def to_dict(self) -> dict:
        import pyvips
        data = {
            'type': self.type,
            'layers': []
        }
        for L in self._layers:
            layer_label: str = L.label
            image: pyvips.Image = L.image
            with kcl.TemporaryDirectory() as tmpdir:
                image.dzsave(f'{tmpdir}/output',
                    overlap=0,
                    tile_size=self._tile_size,
                    layout=pyvips.enums.ForeignDzLayout.DZ
                )
                output_dirname = f'{tmpdir}/output_files'

                # Collect image files in a dict
                image_files = {}
                z = 1
                while True:
                    dirname = f'{output_dirname}/{z}'
                    if not os.path.exists(dirname):
                        break
                    num_zoom_levels = z
                    j = 0
                    while True:
                        if not os.path.exists(f'{dirname}/{j}_0.jpeg'):
                            break
                        k = 0
                        while True:
                            fname = f'{dirname}/{j}_{k}.jpeg'
                            if not os.path.exists(fname):
                                break

                            image_files[f'{z}_{j}_{k}'] = fname
                            k = k + 1
                        j = j + 1
                    z = z + 1

                keys = list(image_files.keys())

                # Store image files in kachery-cloud
                uris = _store_files_parallel([image_files[key] for key in keys], labels=[f'{key}.jpeg' for key in keys], verbose=True)

                # Replace image file names with URIs
                for key, uri in zip(keys, uris):
                    image_files[key] = uri

                layer = {
                    'label': layer_label,
                    'tileSize': self._tile_size,
                    'width': image.width,
                    'height': image.height,
                    'numZoomLevels': num_zoom_levels,
                    'imageFiles': image_files
                }
                data['layers'].append(layer)
        return data
    def child_views(self) -> List[View]:
        return []

# def _store_files(fnames: List[str], *, labels: List[str]) -> List[str]:
#     uris: List[str] = []
#     for fname, label in zip(fnames, labels):
#         print(f'Storing file: {fname}')
#         uri = kcl.store_file(fname, label=label)
#         uris.append(uri)
#     return uris

def _store_files_parallel(fnames: List[str], verbose: bool = True, *, labels: List[str]) -> List[str]:
    executor = ThreadPoolExecutor(max_workers=10)
    results = executor.map(_store_file, fnames, labels, [verbose] * len(fnames))
    return results

def _store_file(fname: str, label: str, verbose: str):
    if verbose:
        print(f'Storing file: {fname}')
    return kcl.store_file(fname, label=label)
