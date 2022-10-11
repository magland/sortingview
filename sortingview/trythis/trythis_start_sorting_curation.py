from typing import Any, List, Tuple, Union
import uuid
import spikeinterface as si
from ..SpikeSortingView import SpikeSortingView
import sortingview.views as vv
import kachery_cloud as kcl


def trythis_start_sorting_curation(*,
    recording: si.BaseRecording,
    sorting: si.BaseSorting,
    label: str,
    initial_curation: dict={},
    raster_plot_subsample_max_firing_rate=50,
    spike_amplitudes_subsample_max_firing_rate=50,
    unit_metrics: Union[List[Any], None]=None
) -> Tuple[str, str]:
    print("Preparing spikesortingview data")
    X = SpikeSortingView.create(
        recording=recording,
        sorting=sorting,
        segment_duration_sec=60 * 20,
        snippet_len=(20, 20),
        max_num_snippets_per_segment=100,
        channel_neighborhood_size=7,
    )

    view = vv.MountainLayout(
        items=[
            vv.MountainLayoutItem(label="Summary", view=X.sorting_summary_view()),
            vv.MountainLayoutItem(
                label="Units table",
                view=X.units_table_view(unit_ids=X.unit_ids, unit_metrics=unit_metrics),
            ),
            vv.MountainLayoutItem(
                label="Raster plot",
                view=X.raster_plot_view(
                    unit_ids=X.unit_ids,
                    _subsample_max_firing_rate=raster_plot_subsample_max_firing_rate,
                ),
            ),
            vv.MountainLayoutItem(
                label="Spike amplitudes",
                view=X.spike_amplitudes_view(
                    unit_ids=X.unit_ids,
                    _subsample_max_firing_rate=spike_amplitudes_subsample_max_firing_rate,
                ),
            ),
            vv.MountainLayoutItem(
                label="Autocorrelograms",
                view=X.autocorrelograms_view(unit_ids=X.unit_ids),
            ),
            vv.MountainLayoutItem(
                label="Cross correlograms",
                view=X.cross_correlograms_view(unit_ids=X.unit_ids),
            ),
            vv.MountainLayoutItem(
                label="Avg waveforms",
                view=X.average_waveforms_view(unit_ids=X.unit_ids),
            ),
            vv.MountainLayoutItem(
                label="Electrode geometry", view=X.electrode_geometry_view()
            ),
            # vv.MountainLayoutItem(
            #    label='Unit similarity matrix',
            #    view=unit_similarity_matrix_view
            # ),
            vv.MountainLayoutItem(
                label="Curation", view=vv.SortingCuration2(), is_control=True, control_height=600
            )
        ]
    )

    if initial_curation is not None:
        sorting_curation_uri = kcl.store_json(initial_curation)
    else:
        sorting_curation_uri = None
    url_state = {'sortingCuration': sorting_curation_uri} if sorting_curation_uri is not None else None
    url = view.url(label=label, state=url_state)

    print(f'''
Instructions for sorting curation.

- Click the link below to open the sortingview GUI in a browser (save this URL somewhere during the course of curation).
- Click the SAVE AS REWRITABLE button on the left panel.
- Follow the instructions to authorize writing to the cloud.
- Perform curation, periodically clicking the SAVE CURATION button.
- You may share this URL with others for curation, but only one person should be curating at a time.
- Once the curation is complete, copy the URI (starts with jot://...) and pass it in to sv.trythis_load_sorting_curation('...') function to get the curation object.
- Alternatively, you can download the curation object to JSON by clicking the "download to JSON" button.

    ''')
    print(url)

    return url