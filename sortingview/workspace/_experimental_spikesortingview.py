import kachery_client as kc
from ..experimental.SpikeSortingView import prepare_spikesortingview_data, SpikeSortingView

def experimental_spikesortingview(self, *, recording_id: str, sorting_id: str, label: str, include_curation: bool):
    R = self.get_recording_extractor(recording_id)
    S = self.get_sorting_extractor(sorting_id)

    cache_key = {
        'type': 'spikesortingview_data',
        'recording_object': R.object(),
        'sorting_object': S.object()
    }

    sortingview_data_uri = kc.get(cache_key)
    if sortingview_data_uri is not None:
        if kc.load_file(sortingview_data_uri) is None:
            sortingview_data_uri = None
    if sortingview_data_uri is None:
        with kc.TemporaryDirectory() as tmpdir:
            fname = tmpdir + '/spikesortingview.h5'
            print('Preparing spikesortingview data')
            prepare_spikesortingview_data(
                recording=R,
                sorting=S,
                recording_description=recording_id,
                sorting_description=sorting_id,
                output_file_name=fname,
                segment_duration_sec=60 * 20,
                snippet_len=(20, 20),
                max_num_snippets_per_segment=100,
                channel_neighborhood_size=7
            )
            sortingview_data_uri = kc.store_file(fname)
    
    fname = kc.load_file(sortingview_data_uri)
    X = SpikeSortingView(fname)
    if include_curation:
        X.set_sorting_curation_uri(self.get_curation_subfeed(sorting_id).uri)
    
    unit_metrics = self.get_unit_metrics_for_sorting(sorting_id)

    f1 = X.create_summary()
    f2 = X.create_units_table(unit_ids=X.unit_ids, unit_metrics=unit_metrics)
    f3 = X.create_autocorrelograms(unit_ids=X.unit_ids)
    f4 = X.create_raster_plot(unit_ids=X.unit_ids)
    f5 = X.create_average_waveforms(unit_ids=X.unit_ids)
    f6 = X.create_spike_amplitudes(unit_ids=X.unit_ids)
    f7 = X.create_electrode_geometry()

    mountain_layout = X.create_mountain_layout(figures=[f1, f2, f3, f4, f5, f6, f7], label=label)

    url = mountain_layout.url()
    return url