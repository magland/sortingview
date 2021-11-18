import spikeextractors as se
import kachery_client as kc
import sortingview as sv
from sortingview.experimental.SpikeSortingView import SpikeSortingView

def main():
    # Prepare an example recording/sorting
    recording, sorting = se.example_datasets.toy_example(K=11, duration=60, seed=3)
    R = sv.LabboxEphysRecordingExtractor.from_memory(recording, serialize=True, serialize_dtype='float32')
    S = sv.LabboxEphysSortingExtractor.from_memory(sorting, serialize=True)

    # Prepare a test metric
    test_metric_data = {}
    for u in S.get_unit_ids():
        test_metric_data[str(u)] = u
    unit_metrics = [
        {
            'name': 'test',
            'label': 'Test metric',
            'data': test_metric_data
        }
    ]

    # Prepare a sorting curation
    feed = kc.load_feed('spikesortingview-example1-curation-uri', create=True)
    subfeed = feed.load_subfeed('main')
    sorting_curation_uri = subfeed.uri
    user_ids = # provide list of user IDs here
    SpikeSortingView.set_sorting_curation_authorized_users(sorting_curation_uri, user_ids)

    print('Preparing spikesortingview data...')
    X = SpikeSortingView.create(
        recording=R,
        sorting=S,
        segment_duration_sec=60 * 20,
        snippet_len=(20, 20),
        max_num_snippets_per_segment=100,
        channel_neighborhood_size=7
    )

    print('Creating figures...')
    f1 = X.create_summary()
    f2 = X.create_units_table(unit_ids=X.unit_ids, unit_metrics=unit_metrics)
    f3 = X.create_autocorrelograms(unit_ids=X.unit_ids)
    f4 = X.create_raster_plot(unit_ids=X.unit_ids)
    f5 = X.create_average_waveforms(unit_ids=X.unit_ids)
    f6 = X.create_spike_amplitudes(unit_ids=X.unit_ids)
    f7 = X.create_electrode_geometry()
    f8 = X.create_live_cross_correlograms()

    mountain_layout = X.create_mountain_layout(
        figures=[f1, f2, f3, f4, f5, f6, f7, f8],
        label='Example',
        sorting_curation_uri=sorting_curation_uri
    )

    url = mountain_layout.url()
    print(url)

if __name__ == '__main__':
    main()