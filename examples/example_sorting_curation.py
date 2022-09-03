# 9/2/22

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

def example_sorting_curation(*, sorting: si.BaseSorting, include_units_table=True, height=500):
    view_sc = vv.SortingCuration2(sorting_id='test', height=height)
    if include_units_table:
        view_ut = create_units_table(sorting=sorting)
        return vv.Box(
            direction='horizontal',
            items=[
                vv.LayoutItem(view_ut, max_size=250),
                vv.LayoutItem(view_sc)
            ],
            height=height
        )
    else:
        return view_sc

if __name__ == '__main__':
    main()
