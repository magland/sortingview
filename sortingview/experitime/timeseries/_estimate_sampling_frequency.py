import numpy as np

def _estimate_sampling_frequency(timestamps: np.ndarray):
    if len(timestamps) <= 1:
        return 0
    deltas = np.diff(timestamps)
    median_delta = np.median(deltas)
    deltas_excluding_outliers = deltas[(median_delta * 0.9 < deltas) & (deltas < median_delta * 1.1)]
    return 1 / float(np.mean(deltas_excluding_outliers))
