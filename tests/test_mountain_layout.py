# 7/5/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://fb7d6f4fcb5a8bc73716f18022142a2ae9ecb19b&project=lqhzprbdrq&label=test%20mountain%20layout

import json
import sortingview as sv
import sortingview.views as vv
import kachery_cloud as kcl
import spikeinterface.extractors as se
from test_autocorrelograms import test_autocorrelograms
from test_cross_correlograms import test_cross_correlograms
from test_raster_plot import test_raster_plot
from test_average_waveforms import test_average_waveforms
from test_units_table import test_units_table
from test_unit_similarity_matrix import test_unit_unit_similarity_matrix


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)

    R = sv.copy_recording_extractor(recording, serialize_dtype='float32')
    S = sv.copy_sorting_extractor(sorting)

    v_units_table = test_units_table(recording=R, sorting=S)
    v_raster_plot = test_raster_plot(recording=R, sorting=S)
    v_autocorrelograms = test_autocorrelograms(sorting=S)
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

    user_ids = None # List of authorized user IDs
    if user_ids is not None:
        assert isinstance(user_ids, list)
        curation_feed = kcl.create_feed()
        sorting_curation_uri = curation_feed.uri
        kcl.set_mutable(
            f'sortingview/sortingCurationAuthorizedUsers/{sorting_curation_uri}',
            json.dumps(user_ids)
        )
    else:
        sorting_curation_uri=None

    url = view.url(
        label='test mountain layout',
        sorting_curation_uri=sorting_curation_uri
    )
    print(url)

if __name__ == '__main__':
    main()
