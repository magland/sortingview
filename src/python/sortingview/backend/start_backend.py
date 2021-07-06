import kachery_client as kc

def start_backend(*, channel: str):
    # register the tasks
    from ..tasks import dummy
    from ..gui.extensions import dummy

    kc.run_task_backend(
        channels=[channel],
        task_function_ids=[
            'sortingview_workspace_list_subfeed.2',
            'example_recording_sortings', 'recording_info.3', 'sorting_info.3',
            'preload_extract_snippets.1', 'get_isi_violation_rates.1', 'get_peak_channels.1',
            'get_unit_snrs.1', 'get_firing_data.1', 'fetch_correlogram_plot_data.2',
            'get_timeseries_segment.1', 'fetch_average_waveform.2', 'test_delay.1', 'individual_cluster_features.1',
            'workspace_action.1', 'workspace_sorting_curation_action.1',
            'fetch_unit_metrics.1', 'fetch_spike_amplitudes.1',
            'latency_test_query.1', 'get_action_latency_test_subfeed.1', 'subfeed_latency_test_append.1',
            'get_python_package_version.1'
        ]
    )