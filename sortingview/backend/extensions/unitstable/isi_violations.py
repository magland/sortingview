import numpy as np
import hither2 as hi
from sortingview.config import job_cache, job_handler
from sortingview.extractors import LabboxEphysRecordingExtractor, LabboxEphysSortingExtractor
import kachery_client as kc

@hi.function(
    'get_isi_violation_rates', '0.1.2',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['sortingview']
)
def get_isi_violation_rates(sorting_object, recording_object, configuration={}, snippet_len=(50, 80)):
    import spikemetrics as sm
    S = LabboxEphysSortingExtractor(sorting_object)
    R = LabboxEphysRecordingExtractor(recording_object)

    samplerate = R.get_sampling_frequency()
#    duration_sec = R.get_num_frames() / samplerate

    isi_threshold_msec = configuration.get('isi_threshold_msec', 2.5)
    unit_ids = configuration.get('unit_ids', S.get_unit_ids())

    ret = {}
    for id in unit_ids:
        spike_train = S.get_unit_spike_train(unit_id=id)
        spike_train = np.sort(spike_train) # make sure the spike train is sorted
        ret[str(id)], _ = sm.metrics.isi_violations( #_ is total violations
            spike_train=spike_train,
            duration=R.get_num_frames(),
            isi_threshold=isi_threshold_msec / 1000 * samplerate
        )
    return ret

def isi_violations(spike_train, duration, isi_threshold):
    """Calculate Inter-Spike Interval (ISI) violations for a spike train.

    Originally written in Matlab by Nick Steinmetz (https://github.com/cortex-lab/sortingQuality)
    Converted to Python by Daniel Denman
    Simplified by Jeremy Magland in response to: https://github.com/magland/sortingview/issues/138

    Inputs:
    -------
    spike_train : array of monotonically increasing spike times (in seconds) [t1, t2, t3, ...]
    duration : length of recording (seconds)
    isi_threshold : threshold for classifying adjacent spikes as an ISI violation
      - this is the biophysical refractory period

    Outputs:
    --------
    fpRate : rate of contaminating spikes as a fraction of overall rate
      - higher values indicate more contamination
    num_violations : total number of violations detected

    """
    # all the interspike intervals
    isi_list = np.diff(spike_train)
    # total number of spikes
    num_spikes = len(spike_train)
    # the expected value of isi
    expected_isi = duration / num_spikes
    # total number of violations
    num_violations = np.sum(isi_list < isi_threshold)

    # Now we assume a poisson process for the spike train

    # the lambda parameter in the distribution of isi: pdf is lambda * e^{-lambda * t}
    lambda0 = 1 / expected_isi
    # the probability that any particular isi is a violation
    p_violation = 1 - np.exp(-lambda0 * isi_threshold)
    # the expected number of violations
    expected_num_violations = len(isi_list) * p_violation

    # The false positive rate normalized by expected rate
    fp_rate = num_violations / expected_num_violations

    return fp_rate, num_violations

@kc.taskfunction('get_isi_violation_rates.2', type='pure-calculation')
def task_get_isi_violation_rates(sorting_object, recording_object, configuration={}, snippet_len=(50, 80)):
    with hi.Config(
        job_cache=job_cache,
        job_handler=job_handler.metrics
    ):
        return get_isi_violation_rates.run(
            sorting_object=sorting_object,
            recording_object=recording_object,
            configuration=configuration
        )