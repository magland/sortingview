from typing import List
from .Figure import Figure

class BoxLayout(Figure):
    def __init__(self, items: List[Figure], direction: str='row'):
        data = {
            'direction': direction,
            'children': [
                item.object for item in items
            ]
        }
        super().__init__(type='BoxLayout.1', data=data)