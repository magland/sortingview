# 7/1/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://95f3bda79b4c65d721d8beb4f8e82058e0107f86&label=test%20layout

import sortingview as sv
import sortingview.views as vv
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
    v_autocorrelograms = test_autocorrelograms(recording=R, sorting=S)
    v_average_waveforms = test_average_waveforms(recording=R, sorting=S)
    v_cross_correlograms = test_cross_correlograms(recording=R, sorting=S)
    v_unit_similarity_matrix = test_unit_unit_similarity_matrix(recording=R, sorting=S)

    view = vv.Box(
        direction='vertical',
        items=[
            vv.LayoutItem(
                vv.Splitter(
                    direction='horizontal',
                    item1=vv.LayoutItem(v_units_table, min_size=100, stretch=1),
                    item2=vv.LayoutItem(
                        vv.Splitter(
                            direction='horizontal',
                            item1=vv.LayoutItem(v_raster_plot, stretch=3),
                            item2=vv.LayoutItem(v_unit_similarity_matrix, stretch=1)
                        ),
                        min_size=200, stretch=3
                    )
                )
            ),
            vv.LayoutItem(
                vv.Box(
                    direction='horizontal',
                    items=[
                        vv.LayoutItem(v_autocorrelograms, stretch=1),
                        vv.LayoutItem(v_average_waveforms, stretch=1),
                        vv.LayoutItem(v_cross_correlograms, stretch=1)
                    ]
                )
            )
        ]
    )

    url = view.url(label='test layout')
    print(url)

if __name__ == '__main__':
    main()