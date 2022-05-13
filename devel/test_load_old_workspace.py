import sortingview as sv


W = sv.load_workspace('workspace://d3f5c350cacdef380c4dc15d27ba81285a7a4b3c9f7f5e05bdd5768af5bcea7b')
print(W.recording_ids)
print(W.sorting_ids)
Rr = W.get_recording_record(W.recording_ids[0])
print(Rr)
Sr = W.get_sorting_record(W.sorting_ids[0])
print(Sr)

R = W.get_recording_extractor(W.recording_ids[0])
S = W.get_sorting_extractor(W.sorting_ids[0])
print(R.get_channel_ids())
print(S.get_unit_ids())

curation = W.get_sorting_curation(W.sorting_ids[0])
print(curation)