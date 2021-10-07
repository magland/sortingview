import numpy as np
import sortingview as sv
from _extract_snippets import extract_snippets

def main():
    R, S = example_recording_sorting()
    X = R.get_traces().T
    times_list = [S.get_unit_spike_train(unit_id=unit_id) for unit_id in [15, 16, 17, 18]]
    times = np.concatenate(times_list)
    L = len(times)
    T = 30
    M = R.get_num_channels()
    K = 6
    snippets = extract_snippets(X, times=times, snippet_size=30) # L x T x M
    snippet_vectors = snippets.reshape((L, T * M))
    features = compute_pca_features(snippet_vectors, K) # L x K
    feature_names = [f'PCA {i + 1}' for i in range(K)]
    E = sv.SpikeExplorer(
        snippets=snippets,
        timestamps=times / R.get_sampling_frequency(),
        features=features,
        feature_names=feature_names
    )
    F = E.figurl()
    url = F.url(label='Example snippets explorer')
    print(url)

def compute_pca_features(X: np.ndarray, num_features: int):
    # X is L x n
    u, s, vt = np.linalg.svd(X, full_matrices=False)
    # u: L x n, s: n, vt: n x n
    features = u[:, :num_features]
    return features



def example_recording_sorting():
    x = {
        "recording_object": {
            "data": {
                "h5_uri": "sha1://159bf8a5a067fe2e6fa0ddd35875c48b4b677da8/despereaux20191125_.nwb_02_r1_13_franklab_default_hippocampus_recording.h5v1?manifest=15bda63463ee3f7eb29008b989f09f4b282b427d"
            },
            "recording_format": "h5_v1"
        },
        "sorting_object": {
            "data": {
                "h5_path": "sha1://e7854e34da661693ee758df4cb9401ef90488a50/despereaux20191125_.nwb_02_r1_13_franklab_default_hippocampus_sorting.h5v1"
            },
            "sorting_format": "h5_v1"
        }
    }
    R = sv.LabboxEphysRecordingExtractor(x['recording_object'])
    S = sv.LabboxEphysSortingExtractor(x['sorting_object'])
    return R, S

if __name__ == '__main__':
    main()