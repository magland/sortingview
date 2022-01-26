import sortingview as sv
import spikeextractors as se

recording, sorting = se.example_datasets.toy_example(K=11, duration=60, seed=6)

R = sv.LabboxEphysRecordingExtractor.from_memory(recording, serialize=True, serialize_dtype='float32')
S = sv.LabboxEphysSortingExtractor.from_memory(sorting, serialize=True)

W = sv.create_workspace()
recording_id = W.add_recording(label='recording1', recording=R)
sorting_id = W.add_sorting(recording_id=recording_id, label='true', sorting=S)

W.set_sorting_curation_authorized_users(sorting_id=sorting_id, user_ids=['jmagland@flatironinstitute.org'])
url2 = W.spikesortingview(recording_id=recording_id, sorting_id=sorting_id, label='Test workspace', include_curation=True)
print(url2)
