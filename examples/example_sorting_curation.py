# 10/10/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-10&d=sha1://bd702d032c8326d65484238ba3b2c505c421e095&label=Sorting%20curation%20example

import kachery_cloud as kcl
import sortingview.views as vv
import spikeinterface.extractors as se
import spikeinterface as si
from helpers.create_units_table import create_units_table


def main():
    kcl.use_sandbox()
    _, sorting = se.toy_example(num_units=12, duration=300, seed=0, num_segments=1)

    view = example_sorting_curation(sorting=sorting)

    url = view.url(label='Sorting curation example')
    print(url)

def example_sorting_curation(*, sorting: si.BaseSorting):
    view_sc = vv.SortingCuration2()

    view_ut = create_units_table(sorting=sorting)

    view_ml = vv.MountainLayout(
        items=[
            vv.MountainLayoutItem(
                label='Units',
                view=view_ut
            ),
            vv.MountainLayoutItem(
                label='Curation',
                view=view_sc,
                is_control=True,
                control_height=600
            )
        ]
    )
    return view_ml

if __name__ == '__main__':
    main()
