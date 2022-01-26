import sortingview as sv

recording = sv.LabboxEphysRecordingExtractor('sha1://a205f87cef8b7f86df7a09cddbc79a1fbe5df60f/2014_11_25_Pair_3_0.json')
sorting_true = sv.LabboxEphysSortingExtractor('sha1://c656add63d85a17840980084a1ff1cdc662a2cd5/2014_11_25_Pair_3_0.firings_true.json')
workspace = sv.create_workspace(label='paired_kampff_example')
rid = workspace.add_recording(label='2014_11_25_Pair_3_0', recording=recording)
sid = workspace.add_sorting(recording_id=rid, label='true', sorting=sorting_true)

url = workspace.spikesortingview(
    recording_id=rid,
    sorting_id=sid,
    label='paired_kampff/2014_11_25_Pair_3_0',
    include_curation=False
)

print(url)
