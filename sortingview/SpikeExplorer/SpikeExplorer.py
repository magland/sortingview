from typing import List
import numpy as np
import kachery_client as kc

class SpikeExplorer:
    def __init__(
        self,
        snippets: np.ndarray, # L x T x M
        timestamps: np.array, #L
        features: np.ndarray, # L x K
        feature_names: List[str]
    ) -> None:
        self._snippets = snippets
        self._timestamps = timestamps
        self._features = features
        self._feature_names = feature_names
    def figurl(self):
        from figurl import Figure
        data = {
            'numSpikes': len(self._timestamps),
            'numChannels': int(self._snippets.shape[2]),
            'featureNames': self._feature_names,
            'snippetsUri': kc.store_npy(self._snippets.astype(np.float32)),
            'timestampsUri': kc.store_npy(self._timestamps.astype(np.float32)),
            'featuresUri': kc.store_npy(self._features.astype(np.float32))
        }
        return Figure(type='sortingview.spikeexplorer.1', data=data)