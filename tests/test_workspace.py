# 7/5/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://0f871ec30d69d2e89bb6726edc8e6ca3c1696c84&project=lqhzprbdrq&label=test%20mountain%20layout

from typing import List
import sortingview as sv
import sortingview.views as vv
from sortingview.SpikeSortingView import SpikeSortingView
import spikeinterface.extractors as se


# Define SpikeInterface extractors for a recording/sorting pair
# See: https://spikeinterface.readthedocs.io/en/latest/
recording, sorting = se.toy_example(num_units=10, duration=120, seed=0)

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

print('Preparing spikesortingview data')
X = SpikeSortingView.create(
    recording=W.get_recording_extractor(recording_id),
    sorting=W.get_sorting_extractor(sorting_id),
    segment_duration_sec=60 * 20,
    snippet_len=(20, 20),
    max_num_snippets_per_segment=100,
    channel_neighborhood_size=7
)
unit_metrics = W.get_unit_metrics_for_sorting(sorting_id)
_raster_plot_subsample_max_firing_rate = None
_spike_amplitudes_max_firing_rate = None

# create a fake unit similiarity matrix
similarity_scores: List[vv.UnitSimilarityScore] = []
for u1 in X.unit_ids:
    for u2 in X.unit_ids:
        similarity_scores.append(
            vv.UnitSimilarityScore(
                unit_id1=u1,
                unit_id2=u2,
                similarity=1 - abs(u1 - u2) / (u1 + u2 + 1) # fake similarity score for testing
            )
        )
unit_similarity_matrix_view = vv.UnitSimilarityMatrix(
    unit_ids=X.unit_ids,
    similarity_scores=similarity_scores
)

view = vv.MountainLayout(
    items=[
        vv.MountainLayoutItem(
            label='Summary',
            view=X.sorting_summary_view()
        ),
        vv.MountainLayoutItem(
            label='Units table',
            view=X.units_table_view(unit_ids=X.unit_ids, unit_metrics=unit_metrics)
        ),
        vv.MountainLayoutItem(
            label='Raster plot',
            view=X.raster_plot_view(unit_ids=X.unit_ids, _subsample_max_firing_rate=_raster_plot_subsample_max_firing_rate)
        ),
        vv.MountainLayoutItem(
            label='Spike amplitudes',
            view=X.spike_amplitudes_view(unit_ids=X.unit_ids, _subsample_max_firing_rate=_spike_amplitudes_max_firing_rate)
        ),
        vv.MountainLayoutItem(
            label='Autocorrelograms',
            view=X.autocorrelograms_view(unit_ids=X.unit_ids)
        ),
        vv.MountainLayoutItem(
            label='Cross correlograms',
            view=X.cross_correlograms_view(unit_ids=X.unit_ids)
        ),
        vv.MountainLayoutItem(
            label='Avg waveforms',
            view=X.average_waveforms_view(unit_ids=X.unit_ids)
        ),
        vv.MountainLayoutItem(
            label='Electrode geometry',
            view=X.electrode_geometry_view()
        ),
        vv.MountainLayoutItem(
            label='Unit similarity matrix',
            view=unit_similarity_matrix_view
        ),
        vv.MountainLayoutItem(
            label='Curation',
            view=vv.SortingCuration(),
            is_control=True
        )
    ]
)

url = view.url(
    label='test mountain layout',
    sorting_curation_uri=sorting_curation_uri
)
print(url)
