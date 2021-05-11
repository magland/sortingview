# Prerequisites:
#    SpikeInterface/spikesorters: `pip install spikesorters`
#    SpyKING CIRCUS: `pip install spyking-circus`
#    On Ubuntu, the following are required for spyking circus:
#        pip install pyqt5
#        apt install qt5-default
#    For more information: https://spyking-circus.readthedocs.io/en/latest/introduction/install.html

import spikeextractors as se
import numpy as np
import labbox_ephys as le
from labbox_ephys import sorters
import kachery_p2p as kp

if __name__ == '__main__':
    # adjust these values
    workspace_uri = '{workspaceUri}'
    recording_id = '{recordingId}' # {recordingLabel}

    workspace = le.load_workspace(workspace_uri)
    le_recording = workspace.get_recording(recording_id)
    recording_object = le_recording['recordingObject']

    sorting_object = sorters.spykingcircus(
        recording_object=recording_object,
        detect_sign=-1,
        adjacency_radius=100,
        detect_threshold=6,
        template_width_ms=3,
        filter=True,
        merge_spikes=True,
        auto_merge=0.75,
        num_workers=None,
        whitening_max_elts=1000,
        clustering_max_elts=10000
    )
    sorting = le.LabboxEphysSortingExtractor(sorting_object)

    S_id = workspace.add_sorting(
        sorting=sorting,
        recording_id=recording_id,
        label='spykingcircus'
    )