import sortingview as sv
import spikeextractors as se

recording, sorting = se.example_datasets.toy_example(K=12)

R = sv.LabboxEphysRecordingExtractor.from_memory(recording, serialize=True, serialize_dtype='float32')
S = sv.LabboxEphysSortingExtractor.from_memory(sorting, serialize=True)

W = sv.create_workspace()
recording_id = W.add_recording(label='recording1', recording=R)
W.add_sorting(recording_id=recording_id, label='true', sorting=S)

W.precalculate()

F = W.figurl()
url = F.url(label='Test workspace')
print(url)
