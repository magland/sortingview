import spikeextractors as se
import numpy as np
import labbox_ephys as le
import kachery_p2p as kp


# Adjust these values
recording_label = 'despy_tet3'
sorting_label = 'sorting'
recording_nwb_path = '<path or URI of nwb recording>'
sorting_nwb_path = '<path or URI of nwb sorting>'
workspace_uri = '{workspaceUri}'

recording_uri = kp.store_object({
    'recording_format': 'nwb',
    'data': {
        'path': recording_nwb_path
    }
})
sorting_uri = kp.store_object({
    'sorting_format': 'nwb',
    'data': {
        'path': sorting_nwb_path
    }
})

sorting = le.LabboxEphysSortingExtractor(sorting_uri, samplerate=30000)
recording = le.LabboxEphysRecordingExtractor(recording_uri, download=True)

workspace = le.load_workspace(workspace_uri)
print(f'Workspace URI: {workspace.get_uri()}')
R_id = workspace.add_recording(recording=recording, label=recording_label)
S_id = workspace.add_sorting(sorting=sorting, recording_id=R_id, label=sorting_label)