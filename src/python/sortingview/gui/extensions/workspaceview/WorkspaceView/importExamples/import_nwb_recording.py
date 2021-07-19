import spikeextractors as se
import numpy as np
import kachery_client as kc
from sortingview import LabboxEphysSortingExtractor, LabboxEphysRecordingExtractor, load_workspace


# Adjust these values
recording_label = 'despy_tet3'
sorting_label = 'sorting'
recording_nwb_path = '<path or URI of nwb recording>'
sorting_nwb_path = '<path or URI of nwb sorting>'
workspace_uri = '{workspaceUri}'

recording_uri = kc.store_object({
    'recording_format': 'nwb',
    'data': {
        'path': recording_nwb_path
    }
})
sorting_uri = kc.store_object({
    'sorting_format': 'nwb',
    'data': {
        'path': sorting_nwb_path
    }
})

sorting = LabboxEphysSortingExtractor(sorting_uri, samplerate=30000)
recording = LabboxEphysRecordingExtractor(recording_uri, download=True)

workspace = load_workspace(workspace_uri)
print(f'Workspace URI: {workspace.uri}')
R_id = workspace.add_recording(recording=recording, label=recording_label)
S_id = workspace.add_sorting(sorting=sorting, recording_id=R_id, label=sorting_label)