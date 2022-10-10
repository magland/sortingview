# 8/31/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://428301bc920d206a927143a924165a0a91dc8a63&label=Mountain%20layout%20example

import sortingview.views as vv
import spikeinterface.extractors as se
import spikeinterface as si
import kachery_cloud as kcl
from example_autocorrelograms import example_autocorrelograms
from example_cross_correlograms import example_cross_correlograms
from example_raster_plot import example_raster_plot
from example_average_waveforms import example_average_waveforms
from example_units_table import example_units_table
from example_unit_similarity_matrix import example_unit_unit_similarity_matrix


def main():
    kcl.use_sandbox()
    R, S = se.toy_example(num_units=12, duration=300, seed=0, num_segments=1)

    view = example_mountain_layout(recording=R, sorting=S)

    url = view.url(
        label='Mountain layout example'
    )
    print(url)

def example_mountain_layout(recording: si.BaseRecording, sorting: si.BaseSorting, height=800):
    R = recording
    S = sorting

    v_units_table = example_units_table(recording=R, sorting=S)
    v_raster_plot = example_raster_plot(recording=R, sorting=S)
    v_autocorrelograms = example_autocorrelograms(sorting=S)
    v_average_waveforms = example_average_waveforms(recording=R, sorting=S)
    v_cross_correlograms = example_cross_correlograms(sorting=S, hide_unit_selector=True)
    v_unit_similarity_matrix = example_unit_unit_similarity_matrix(recording=R, sorting=S)

    view = vv.MountainLayout(
        height=height,
        items=[
            vv.MountainLayoutItem(
                label='Units',
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
                label='Avg. waveforms',
                view=v_average_waveforms
            ),
            vv.MountainLayoutItem(
                label='Cross correlograms',
                view=v_cross_correlograms
            ),
            vv.MountainLayoutItem(
                label='Unit similarity matrix',
                view=v_unit_similarity_matrix,
                is_control=True,
                control_height=300
            )
        ]
    )

    return view

if __name__ == '__main__':
    main()
