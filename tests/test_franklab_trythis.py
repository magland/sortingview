# 7/5/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://0f871ec30d69d2e89bb6726edc8e6ca3c1696c84&project=lqhzprbdrq&label=test%20mountain%20layout

import sortingview as sv
import spikeinterface.extractors as se


# Define SpikeInterface extractors for a recording/sorting pair
# See: https://spikeinterface.readthedocs.io/en/latest/
recording, sorting = se.toy_example(num_units=10, duration=120, seed=0)

# Note that only some recording/sorting extractors are supported by sortingview
# Here is how we create copies of the extractors that are compatible with sortingview
R = sv.copy_recording_extractor(recording=recording, serialize_dtype='float32')
S = sv.copy_sorting_extractor(sorting=sorting)

sv.trythis_start_sorting_curation(
    recording=R,
    sorting=S,
    label='Test trythis sorting curation',
    raster_plot_subsample_max_firing_rate=50,
    spike_amplitudes_subsample_max_firing_rate=50,
    unit_metrics=[]
)

print('')
sorting_curation_uri = input('After curating, enter the URI (starts with jot://) ')
print('')

curation = sv.trythis_load_sorting_curation(sorting_curation_uri)
print(curation)