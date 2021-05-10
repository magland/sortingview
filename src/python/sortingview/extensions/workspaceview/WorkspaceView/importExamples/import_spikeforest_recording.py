import spikeextractors as se
import numpy as np
import labbox_ephys as le
import kachery_p2p as kp

# Here are some examples to select from
X1 = {
    "label": "SF/synth_magland_noise10_K10_C4/001_synth",
    "recording_uri": "sha1://f060669aadaa0f8ebe296bf72895df3899f8cf45/SF/synth_magland_noise10_K10_C4/001_synth.json",
    "sorting_true_uri": "sha1://5b07e41bf62c045a549242c0caa866d272a33ab8/firings_true.mda"
}
X2 = {
    "label": "SF/PAIRED_BOYDEN/paired_boyden32c/419_1_7",
    "recording_uri": "sha1://759c81e6e20d3c352eaff6ce5d4dc7f948c45f25/SF/PAIRED_BOYDEN/paired_boyden32c/419_1_7.json",
    "sorting_true_uri": "sha1://a5b7de64d7a2a96c0e1af70cdb2d4ae927e4949d/firings_true.mda"
}
X3 = {
    "label": "SF/PAIRED_KAMPFF/paired_kampff/2014_11_25_Pair_3_0",
    "recording_uri": "sha1://a205f87cef8b7f86df7a09cddbc79a1fbe5df60f/SF/PAIRED_KAMPFF/paired_kampff/2014_11_25_Pair_3_0.json",
    "sorting_true_uri": "sha1://1cd517687aeca7ecdfaa9695680038d142a75031/firings_true.mda"
}
# To find more examples, see: https://github.com/flatironinstitute/spikeforest_recordings
# However: note that some processing needs to be done to the files in this repo (to add the manifests to the raw data). This is WIP

# Adjust these values ###########################
X = X1 # Select example from above
workspace_uri = '{workspaceUri}'
#################################################

recording_label = X['label']
recording_uri = X['recording_uri']
sorting_true_uri = X['sorting_true_uri']
recording = le.LabboxEphysRecordingExtractor(recording_uri, download=True)
sorting_true = le.LabboxEphysSortingExtractor(sorting_true_uri, samplerate=30000)

sorting_label = 'true'
workspace = le.load_workspace(workspace_uri)
print(f'Workspace URI: {workspace.get_uri()}')
R_id = workspace.add_recording(recording=recording, label=recording_label)
S_id = workspace.add_sorting(sorting=sorting_true, recording_id=R_id, label=sorting_label)