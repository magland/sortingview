from typing import List
import numpy as np
from .Figure import Figure

def create_console_view(*, console_lines: List[dict]):    
    data = {
        'type': 'Console',
        'consoleLines': console_lines
    }
    return Figure(data=data, label='Console')