import os
import numpy as np
import kachery_client as kc
import figurl as fig
import sortingview as sv
from sortingview.experimental.SpikeSortingView.prepare_spikesortingview_data import prepare_spikesortingview_data
from sortingview.experimental.SpikeSortingView.SpikeSortingView import SpikeSortingView

def main():
    R, S, recording_description, sorting_description = _load_recording_sorting()

    fname = 'a.spikesortingview.h5'
    # prepare_spikesortingview_data(
    #     recording=R,
    #     sorting=S,
    #     recording_description=recording_description,
    #     sorting_description=sorting_description,
    #     output_file_name=fname,
    #     segment_duration_sec=60 * 20,
    #     snippet_len=(20, 20),
    #     max_num_snippets_per_segment=100,
    #     channel_neighborhood_size=7
    # )
    X = SpikeSortingView(fname)
    a = X.create_summary()
    b = X.create_units_table(unit_ids=X.unit_ids)
    c = X.create_autocorrelograms(unit_ids=X.unit_ids)
    d = X.create_raster_plot(unit_ids=X.unit_ids)
    e = X.create_average_waveforms(unit_ids=X.unit_ids)
    print(a.url())
    print(b.url())
    print(c.url())
    print(d.url())
    print(e.url())

    composite_data = {
        'type': 'Composite',
        'layout': 'default',
        'views': [
            {
                'type': view0.data['type'],
                'label': view0.label,
                'figureDataSha1': _upload_data_and_return_sha1(view0.data),
                'defaultHeight': 300
            }
            for view0 in [a, b, c, d, e]
        ]
    }

    F = fig.Figure(view_url='gs://figurl/spikesortingview-1', data=composite_data)
    url = F.url(label='Test composite')
    print(url)

def _upload_data_and_return_sha1(data):
    data_uri = _store_json(data)
    data_hash = data_uri.split('/')[2]
    kc.upload_file(data_uri, channel=os.environ['FIGURL_CHANNEL'])
    return data_hash

def _store_json(x: dict):
    from figurl.core.serialize_wrapper import _serialize
    return kc.store_json(_serialize(x))

def _load_recording_sorting():
    x = {
        "recording_object": {
            "data": {
                "h5_uri": "sha1://159bf8a5a067fe2e6fa0ddd35875c48b4b677da8/despereaux20191125_.nwb_02_r1_13_franklab_default_hippocampus_recording.h5v1?manifest=15bda63463ee3f7eb29008b989f09f4b282b427d"
            },
            "recording_format": "h5_v1"
        },
        "sorting_object": {
            "data": {
                "h5_path": "sha1://e7854e34da661693ee758df4cb9401ef90488a50/despereaux20191125_.nwb_02_r1_13_franklab_default_hippocampus_sorting.h5v1"
            },
            "sorting_format": "h5_v1"
        }
    }
    R = sv.LabboxEphysRecordingExtractor(x['recording_object'])
    S = sv.LabboxEphysSortingExtractor(x['sorting_object'])
    recording_description = 'despereaux20191125_.nwb_02_r1_13_franklab_default_hippocampus_recording'
    sorting_description = 'sorting'
    return R, S, recording_description, sorting_description

if __name__ == '__main__':
    main()