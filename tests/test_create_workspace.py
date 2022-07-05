# 7/5/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://0f871ec30d69d2e89bb6726edc8e6ca3c1696c84&project=lqhzprbdrq&label=test%20mountain%20layout

import sortingview as sv
import sortingview.views as vv
import spikeinterface.extractors as se
from test_autocorrelograms import test_autocorrelograms
from test_cross_correlograms import test_cross_correlograms
from test_raster_plot import test_raster_plot
from test_average_waveforms import test_average_waveforms
from test_units_table import test_units_table
from test_unit_similarity_matrix import test_unit_unit_similarity_matrix


# Define SpikeInterface extractors for a recording/sorting pair
# See: https://spikeinterface.readthedocs.io/en/latest/
recording, sorting = se.toy_example(num_units=6, duration=120, seed=0)

# Note that only some recording/sorting extractors are supported by sortingview
# Here is how we create copies of the extractors that are compatible with sortingview
R = sv.copy_recording_extractor(recording=recording, serialize_dtype='float32')
S = sv.copy_sorting_extractor(sorting=sorting)

# Create a sortingview workspace and add the recording/sorting
W: sv.Workspace = sv.create_workspace(label='example')
recording_id = W.add_recording(label='recording1', recording=R)
sorting_id = W.add_sorting(recording_id=recording_id, label='true', sorting=S)

# Print the workspace URI for loading at a later time
# You may want to store this in a database
print(f'Workspace URI: {W.uri}')

# Optionally create a curation feed and set the access permissions
W.create_curation_feed_for_sorting(sorting_id=sorting_id)
W.set_sorting_curation_authorized_users(sorting_id=sorting_id, user_ids=['jmagland@flatironinstitute.org'])
sorting_curation_uri = W.get_sorting_curation_uri(sorting_id=sorting_id)

# Prepare a visualization and print the figURL
v_units_table = test_units_table(recording=R, sorting=S)
v_raster_plot = test_raster_plot(recording=R, sorting=S)
v_autocorrelograms = test_autocorrelograms(recording=R, sorting=S)
v_average_waveforms = test_average_waveforms(recording=R, sorting=S)
v_cross_correlograms = test_cross_correlograms(recording=R, sorting=S)
v_unit_similarity_matrix = test_unit_unit_similarity_matrix(recording=R, sorting=S)
v_sorting_curation = vv.SortingCuration()

view = vv.MountainLayout(
    items=[
        vv.MountainLayoutItem(
            label='Units table',
            view=v_units_table
        ),
        vv.MountainLayoutItem(
            label='Raster plot',
            view=v_raster_plot
        ),
        vv.MountainLayoutItem(
            label='Autocorrelograms',
            view=v_autocorrelograms
        ),
        vv.MountainLayoutItem(
            label='Avg waveforms',
            view=v_average_waveforms
        ),
        vv.MountainLayoutItem(
            label='Cross correlograms',
            view=v_cross_correlograms
        ),
        vv.MountainLayoutItem(
            label='Unit similarity matrix',
            view=v_unit_similarity_matrix
        ),
        vv.MountainLayoutItem(
            label='Curation',
            view=v_sorting_curation,
            is_control=True
        )
    ]
)

url = view.url(
    label='test mountain layout',
    sorting_curation_uri=sorting_curation_uri
)
print(url)
