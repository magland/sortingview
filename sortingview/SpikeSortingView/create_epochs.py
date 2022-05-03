from typing import List, Union
import numpy as np
from .Figure import Figure

def create_epochs(*, epochs: List[dict], label: str):
    data = {
        'type': 'Epochs',
        'epochs': epochs
    }
    return Figure(
        data=data,
        label=label
    )