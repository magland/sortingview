import sortingview as sv
import spikeextractors as se

recording, sorting = se.example_datasets.toy_example(K=11, duration=60, seed=6)

R = sv.LabboxEphysRecordingExtractor.from_memory(recording, serialize=True, serialize_dtype='float32')
S = sv.LabboxEphysSortingExtractor.from_memory(sorting, serialize=True)

W = sv.create_workspace()
recording_id = W.add_recording(label='recording1', recording=R)
sorting_id = W.add_sorting(recording_id=recording_id, label='true', sorting=S)

metrics = [{'name': 'isolation',
  'label': 'isolation',
  'tooltip': 'isolation',
  'data': {'1': 0.5557000000000001,
   '2': 0.973491773308958,
   '3': 0.9594808126410836,
   '4': 0.976526717557252,
   '5': 0.5114,
   '6': 0.8603999999999999,
   '7': 0.8405797101449275,
   '8': 0.9201365187713311,
   '9': 0.8266666666666668,
   '10': 0.5917,
   '11': 0.960158013544018,
   '12': 0.5145}},
 {'name': 'noise_overlap',
  'label': 'noise_overlap',
  'tooltip': 'noise_overlap',
  'data': {'1': 0.45720000000000005,
   '2': 0.006581352833637921,
   '3': 0.00801354401805876,
   '4': 0.00591603053435108,
   '5': 0.4991,
   '6': 0.09499999999999997,
   '7': 0.0017107309486780187,
   '8': 0.0,
   '9': 0.00260869565217392,
   '10': 0.395,
   '11': 0.010399999999999965,
   '12': 0.4909}}]
W.set_unit_metrics_for_sorting(sorting_id=sorting_id, metrics=metrics)

W.set_sorting_curation_authorized_users(sorting_id=sorting_id, user_ids=['jmagland@flatironinstitute.org'])
url2 = W.spikesortingview(recording_id=recording_id, sorting_id=sorting_id, label='Test workspace', include_curation=True)
print(url2)
