import random

class Sync:
    def __init__(self) -> None:
        self._id = _random_string(10)
    @property
    def object(self):
        return {'_syncId': self._id}

def _random_string(num_chars: int) -> str:
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return ''.join(random.choice(chars) for _ in range(num_chars))