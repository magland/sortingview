import os
import math
import hither2 as hi
from hither2.dockerimage import RemoteDockerImage
import kachery_client as kc
import numpy as np
from sortingview.config import job_cache, job_handler
from sortingview.serialize_wrapper import serialize_wrapper
from sortingview.helpers import get_unit_waveforms_from_snippets_h5
from sortingview.helpers import prepare_snippets_h5


@kc.taskfunction('individual_cluster_features.1', type='pure-calculation')
def task_individual_cluster_featurest(recording_object, sorting_object, unit_id, snippet_len=(50, 80)):
    with hi.Config(job_handler=job_handler.clusters, job_cache=job_cache):
        with hi.Config(job_handler=job_handler.extract_snippets):
            snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object, snippet_len=snippet_len)
        return individual_cluster_features.run(
            snippets_h5=snippets_h5,
            unit_id=unit_id
        )

@kc.taskfunction('pair_cluster_features.4', type='pure-calculation')
def task_pair_cluster_features(recording_object, sorting_object, unit_id1, unit_id2, snippet_len=(50, 80)):
    with hi.Config(job_handler=job_handler.clusters, job_cache=job_cache):
        with hi.Config(job_handler=job_handler.extract_snippets):
            snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object, snippet_len=snippet_len)
        return pair_cluster_features.run(
            snippets_h5=snippets_h5,
            unit_id1=unit_id1,
            unit_id2=unit_id2
        )


def subsample_inds(n, m):
    if m >= n:
        return range(n)
    incr = n / m
    return [int(math.floor(i * incr)) for i in range(m)]

@hi.function(
    'individual_cluster_features', '0.1.4',
    image=RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['sortingview']
)
@serialize_wrapper
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
    
    unit_waveforms, unit_waveforms_channel_ids, channel_locations0, sampling_frequency, unit_spike_train = get_unit_waveforms_from_snippets_h5(h5_path, unit_id, max_num_events=max_num_events)
    
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

@hi.function(
    'pair_cluster_features', '0.1.4',
    image=RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['sortingview']
)
@serialize_wrapper
def pair_cluster_features(snippets_h5, unit_id1, unit_id2, max_num_events=1000):
    import h5py
    h5_path = kc.load_file(snippets_h5)
    assert h5_path is not None
    
    # Get the unit waveforms
    unit_waveforms1, unit_waveforms_channel_ids1, channel_locations1, sampling_frequency1, unit_spike_train1 = get_unit_waveforms_from_snippets_h5(h5_path, unit_id1, max_num_events=max_num_events)
    unit_waveforms2, unit_waveforms_channel_ids2, channel_locations2, sampling_frequency2, unit_spike_train2 = get_unit_waveforms_from_snippets_h5(h5_path, unit_id2, max_num_events=max_num_events)

    # Find the channel ids
    channel_ids = [ch for ch in unit_waveforms_channel_ids1 if ch in unit_waveforms_channel_ids2]
    if len(channel_ids) == 0:
        raise Exception('Units do not have any channels in common')
    print(f'Using channel IDs: {channel_ids}')
    
    # Get the indices of the channels
    channel_inds1 = []
    channel_inds2 = []
    for channel_id in channel_ids:
        channel_inds1.append(unit_waveforms_channel_ids1.tolist().index(channel_id))
        channel_inds2.append(unit_waveforms_channel_ids2.tolist().index(channel_id))
    
    # Restrict the unit waveforms to the common channels
    unit_waveforms1 = unit_waveforms1[:, channel_inds1, :] # L1 x M x T
    unit_waveforms2 = unit_waveforms2[:, channel_inds2, :] # L2 x M x T
    L1 = unit_waveforms1.shape[0]
    L2 = unit_waveforms2.shape[0]
    L = L1 + L2

    # Calculate the avg waveforms
    avg_waveform1 = np.mean(unit_waveforms1, axis=0) # M x T
    avg_waveform2 = np.mean(unit_waveforms2, axis=0) # M x T

    # Find the discriminating direction
    discriminating_waveform = avg_waveform2 - avg_waveform1 # M x T
    discriminating_features1 = np.array([np.sum(discriminating_waveform * unit_waveforms1[i, :, :]) for i in range(L1)])
    discriminating_features2 = np.array([np.sum(discriminating_waveform * unit_waveforms2[i, :, :]) for i in range(L2)])
    discriminating_features = np.concatenate((discriminating_features1, discriminating_features2))

    unit_waveforms1b = unit_waveforms1 - avg_waveform1
    unit_waveforms2b = unit_waveforms2 - avg_waveform2

    unit_waveforms_b = np.concatenate((unit_waveforms1b, unit_waveforms2b), axis=0)
    
    assert unit_waveforms_b.shape[0] == L

    unit_spike_train = np.concatenate((unit_spike_train1, unit_spike_train2))

    labels = np.concatenate((np.ones(unit_spike_train1.shape) * unit_id1, np.ones(unit_spike_train2.shape) * unit_id2))
    
    from sklearn.decomposition import PCA
    nf = 1 # number of features

    # L = number of waveforms (number of spikes)
    # M = number of electrodes in nbhd
    # T = num. timepoints in the snippet
    W = unit_waveforms_b # L x M x T

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

    x = discriminating_features.astype(np.float32)
    y = features[:, 0].squeeze().astype(np.float32)

    x = x / np.std(x)
    y = y / np.std(y)

    return dict(
        timepoints=unit_spike_train.astype(np.float32),
        x=x,
        y=y,
        labels=labels.astype(np.int32)
    )