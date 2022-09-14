# 9/14/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-9&d=sha1://7719fce3538437c9e739692bef2f9d1cd0118b8f&label=Timeseries%20graph%20example

import numpy as np
import sortingview.views as vv
import kachery_cloud as kcl
from example_timeseries_graph import example_timeseries_graph


def main():
    kcl.use_sandbox()

    v_tg = example_timeseries_graph()

    v_a = vv.Annotations()

    view = vv.Splitter(
        direction='horizontal',
        item1=vv.LayoutItem(
                v_a,
                max_size=300
            ),
        item2=vv.LayoutItem(
            v_tg
        )
    )

    url = view.url(label='Timeseries graph example')
    print(url)


if __name__ == '__main__':
    main()
