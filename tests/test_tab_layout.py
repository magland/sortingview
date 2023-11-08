# 7/13/22
# https://www.figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://b4a5ba2dcb9ca6f41fe8f04e94c2428d8eee3615&label=test%20tab%20layout

import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se
from test_autocorrelograms import test_autocorrelograms
from test_cross_correlograms import test_cross_correlograms
from test_raster_plot import test_raster_plot
from test_average_waveforms import test_average_waveforms
from test_units_table import test_units_table
from test_unit_similarity_matrix import test_unit_unit_similarity_matrix


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)
    assert isinstance(recording, si.BaseRecording)

    R = recording
    S = sorting

    v_units_table = test_units_table(recording=R, sorting=S)
    v_raster_plot = test_raster_plot(recording=R, sorting=S)
    v_autocorrelograms = test_autocorrelograms(sorting=S)
    v_average_waveforms = test_average_waveforms(recording=R, sorting=S)
    v_cross_correlograms = test_cross_correlograms(recording=R, sorting=S)
    v_unit_similarity_matrix = test_unit_unit_similarity_matrix(recording=R, sorting=S)

    view = vv.TabLayout(
        items=[
            vv.TabLayoutItem(label="Units table", view=v_units_table),
            vv.TabLayoutItem(label="Raster plot", view=v_raster_plot),
            vv.TabLayoutItem(label="Autocorrelograms", view=v_autocorrelograms),
            vv.TabLayoutItem(label="Avg waveforms", view=v_average_waveforms),
            vv.TabLayoutItem(label="Cross correlograms", view=v_cross_correlograms),
            vv.TabLayoutItem(label="Unit similarity matrix", view=v_unit_similarity_matrix),
        ]
    )

    url = view.url(label="test tab layout")
    print(url)


if __name__ == "__main__":
    main()
