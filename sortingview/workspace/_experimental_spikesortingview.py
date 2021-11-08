import kachery_client as kc
from ..experimental.SpikeSortingView import SpikeSortingView

def experimental_spikesortingview(self, *, recording_id: str, sorting_id: str, label: str, include_curation: bool):
    R = self.get_recording_extractor(recording_id)
    S = self.get_sorting_extractor(sorting_id)

    print('Preparing spikesortingview data')
    X = SpikeSortingView.create(
        recording=R,
        sorting=S,
        segment_duration_sec=60 * 20,
        snippet_len=(20, 20),
        max_num_snippets_per_segment=100,
        channel_neighborhood_size=7
    )

    if include_curation:
        sorting_curation_uri = self.get_curation_subfeed(sorting_id).uri
    else:
        sorting_curation_uri = None
    
    unit_metrics = self.get_unit_metrics_for_sorting(sorting_id)

    f1 = X.create_summary()
    f2 = X.create_units_table(unit_ids=X.unit_ids, unit_metrics=unit_metrics)
    f3 = X.create_autocorrelograms(unit_ids=X.unit_ids)
    f4 = X.create_raster_plot(unit_ids=X.unit_ids)
    f5 = X.create_average_waveforms(unit_ids=X.unit_ids)
    f6 = X.create_spike_amplitudes(unit_ids=X.unit_ids)
    f7 = X.create_electrode_geometry()
    f8 = X.create_live_cross_correlograms()

    mountain_layout = X.create_mountain_layout(figures=[f1, f2, f3, f4, f5, f6, f7, f8], label=label, sorting_curation_uri=sorting_curation_uri)

    url = mountain_layout.url()
    return url