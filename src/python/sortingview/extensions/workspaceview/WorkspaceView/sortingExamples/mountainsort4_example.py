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

    sorting_object = sorters.mountainsort4(
        recording_object=recording_object,
        num_workers=1
    )
    sorting = le.LabboxEphysSortingExtractor(sorting_object)

    S_id = workspace.add_sorting(
        sorting=sorting,
        recording_id=recording_id,
        label='mountainsort4'
    )