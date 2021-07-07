import os
import math
import hither2 as hi
from hither2.dockerimage import RemoteDockerImage
import kachery_client as kc
import labbox_ephys as le
from labbox_ephys.helpers.prepare_snippets_h5 import prepare_snippets_h5
import numpy as np
from sortingview.config import job_cache, job_handler


# @hi.function('createjob_individual_cluster_features', '0.1.0', register_globally=True)
# def createjob_individual_cluster_features(labbox, recording_object, sorting_object, unit_id, snippet_len=(50, 80)):
#     from labbox_ephys import prepare_snippets_h5
#     jh = labbox.get_job_handler('partition1')
#     jc = labbox.get_job_cache()
#     with hi.Config(
#         job_cache=jc,
#         job_handler=jh,
#         use_container=jh.is_remote()
#     ):
#         snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object, snippet_len=snippet_len)
#         return individual_cluster_features.run(
#             snippets_h5=snippets_h5,
#             unit_id=unit_id
#         )

@kc.taskfunction('individual_cluster_features.1', type='pure-calculation')
def task_individual_cluster_featurest(recording_object, sorting_object, unit_id, snippet_len=(50, 80)):
    with hi.Config(job_handler=job_handler.clusters, job_cache=job_cache):
        with hi.Config(job_handler=job_handler.extract_snippets):
            snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object, snippet_len=snippet_len)
        return individual_cluster_features.run(
            snippets_h5=snippets_h5,
            unit_id=unit_id
        )


def subsample_inds(n, m):
    if m >= n:
        return range(n)
    incr = n / m
    return [int(math.floor(i * incr)) for i in range(m)]

@hi.function(
    'individual_cluster_features', '0.1.4',
    image=RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['labbox_ephys']
)
@le.serialize
def individual_cluster_features(snippets_h5, unit_id, max_num_events=1000):
    import h5py
    h5_path = kc.load_file(snippets_h5)
    assert h5_path is not None
    # with h5py.File(h5_path, 'r') as f:
    #     unit_ids = np.array(f.get('unit_ids'))
    #     channel_ids = np.array(f.get('channel_ids'))
    #     channel_locations = np.array(f.get(f'channel_locations'))
    #     sampling_frequency = np.array(f.get('sampling_frequency'))[0].item()
    #     unit_spike_train = np.array(f.get(f'unit_spike_trains/{unit_id}'))
    #     unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms')) # L x M x T
    #     unit_waveforms_channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))
    #     if len(unit_spike_train) > max_num_events:
    #         inds = subsample_inds(len(unit_spike_train), max_num_events)
    #         unit_spike_train = unit_spike_train[inds]
    #         unit_waveforms = unit_waveforms[inds]
    
    unit_waveforms, unit_waveforms_channel_ids, channel_locations0, sampling_frequency, unit_spike_train = le.get_unit_waveforms_from_snippets_h5(h5_path, unit_id, max_num_events=max_num_events)
    
    from sklearn.decomposition import PCA
    nf = 2 # number of features

    # L = number of waveforms (number of spikes)
    # M = number of electrodes in nbhd
    # T = num. timepoints in the snippet
    W = unit_waveforms # L x M x T

    # subtract mean for each channel and waveform
    for i in range(W.shape[0]):
        for m in range(W.shape[1]):
            W[i, m, :] = W[i, m, :] - np.mean(W[i, m, :])
    X = W.reshape((W.shape[0], W.shape[1] * W.shape[2])) # L x MT
    pca = PCA(n_components=nf)
    pca.fit(X)

    # L = number of waveforms (number of spikes)
    # nf = number of features
    features = pca.transform(X) # L x nf

    return dict(
        timepoints=unit_spike_train.astype(np.float32),
        x=features[:, 0].squeeze().astype(np.float32),
        y=features[:, 1].squeeze().astype(np.float32)
    )