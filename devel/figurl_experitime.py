import numpy as np
import sortingview.figurl as fig
from sortingview import experitime

channel_names = ['channel1', 'channel2']
n = 3000
timestamps = np.array(np.arange(n), dtype=np.float32)
values = np.array([np.cos(timestamps / n * 2 * np.pi * 10), np.cos(timestamps / n * 2 * np.pi * 10)**2], dtype=np.float32).T

X = experitime.Timeseries.from_numpy(
    channel_names=channel_names,
    timestamps=timestamps,
    values=values,
    type='continuous'
)

F = X.figurl()
print(F.url())
