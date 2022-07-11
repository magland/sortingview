# %%
from typing import List
import kachery_cloud as kcl
import sortingview as sv
import sortingview.views as vv
from sortingview.SpikeSortingView import SpikeSortingView
# %%
# Retrieve the workspace URI from the local mutable
# which was created in the previous notebook
workspace_uri = kcl.get_mutable_local('sortingview-workspace-example-uri')
# %%
# Load the workspace and get the sorting/recording IDs
W = sv.load_workspace(workspace_uri)
recording_id = W.recording_ids[0]
sorting_id = W.get_sorting_ids_for_recording(recording_id)[0]
# %%
print('Preparing spikesortingview data')
X = SpikeSortingView.create(
    recording=W.get_recording_extractor(recording_id),
    sorting=W.get_sorting_extractor(sorting_id),
    segment_duration_sec=60 * 20,
    snippet_len=(20, 20),
    max_num_snippets_per_segment=100,
    channel_neighborhood_size=7
)
# %%
# Get the unit metrics (if they have been set)
unit_metrics = W.get_unit_metrics_for_sorting(sorting_id)
print(unit_metrics)
# %%
# For subsampling the raster and spike amplitudes plots
_raster_plot_subsample_max_firing_rate = None
_spike_amplitudes_subsample_max_firing_rate = None
# %%
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
# Create the similarity matrix view
unit_similarity_matrix_view = vv.UnitSimilarityMatrix(
    unit_ids=X.unit_ids,
    similarity_scores=similarity_scores
)
# %%
# Assemble the views in a layout
# You can replace this with other layouts
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
            view=X.spike_amplitudes_view(unit_ids=X.unit_ids, _subsample_max_firing_rate=_spike_amplitudes_subsample_max_firing_rate)
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
# %%
# Generate the figurl (and upload data to kachery cloud)
url = view.url(
    label='sortingview workspace example',
    sorting_curation_uri=sorting_curation_uri
)
print(url)
# 7/9/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://5be362b05674e7c0c32da8f542b15b255ffc0dd6&project=lqhzprbdrq&label=sortingview%20workspace%20example

# %%
# Assemble the views in a different layout
v_unit_selection = X.units_table_view(unit_ids=X.unit_ids) # no metrics
v_aw = X.average_waveforms_view(unit_ids=X.unit_ids)
v_ac = X.autocorrelograms_view(unit_ids=X.unit_ids)
v_cc = X.cross_correlograms_view(unit_ids=X.unit_ids, hide_unit_selector=True)
v_sa = X.spike_amplitudes_view(unit_ids=X.unit_ids, hide_unit_selector=True)
v_sm = unit_similarity_matrix_view
v_curation = vv.SortingCuration()
view = vv.Box(
    direction='horizontal',
    items=[
        vv.LayoutItem(
            vv.Box(
                direction='vertical',
                items=[
                    vv.LayoutItem(v_unit_selection),
                    vv.LayoutItem(v_curation, max_size=250)
                ]
            ),
            max_size=150
        ),
        vv.LayoutItem(
            vv.Box(
                direction='vertical',
                items=[
                    vv.LayoutItem(
                        vv.Splitter(
                            direction='horizontal',
                            item1=vv.LayoutItem(v_aw),
                            item2=vv.LayoutItem(v_ac)
                        )
                    ),
                    vv.LayoutItem(
                        vv.Splitter(
                            direction='horizontal',
                            item1=vv.LayoutItem(v_cc),
                            item2=vv.LayoutItem(vv.Box(
                                direction='vertical',
                                items=[
                                    vv.LayoutItem(v_sa),
                                    vv.LayoutItem(v_sm)
                                ]
                            ))
                        )
                    )
                ]
            )
        )
    ]
)
# Generate the figurl (and upload data to kachery cloud)
url = view.url(
    label='sortingview workspace example (alt layout)',
    sorting_curation_uri=sorting_curation_uri
)
print(url)
# 7/9/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://f07bf04b51dd183f8b55674449b4691ffd8c052f&project=lqhzprbdrq&label=sortingview%20workspace%20example%20%28alt%20layout%29