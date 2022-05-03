import sortingview as sv
import spikeinterface.extractors as se

recording, sorting = se.toy_example(num_units=6, duration=120)

R = sv.copy_recording_extractor(recording=recording, serialize_dtype='float32')
S = sv.copy_sorting_extractor(sorting=sorting)

W: sv.Workspace = sv.create_workspace(label='example')
recording_id = W.add_recording(label='recording1', recording=R)
sorting_id = W.add_sorting(recording_id=recording_id, label='true', sorting=S)

W.create_curation_feed_for_sorting(sorting_id=sorting_id)
W.set_sorting_curation_authorized_users(sorting_id=sorting_id, user_ids=['jmagland@flatironinstitute.org'])
url2 = W.spikesortingview(recording_id=recording_id, sorting_id=sorting_id, label='Test workspace')
print(url2)
