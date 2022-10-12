# 10/12/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-10&d=sha1://38d3cecf7407199f9eb86a5f751faafe65ffbe84&s={"timeRange":[30,33]}&label=Timeseries%20graph%20example

import numpy as np
import sortingview.views as vv
import kachery_cloud as kcl


def main():
    from example_timeseries_graph import example_timeseries_graph
    
    kcl.use_sandbox()

    view = example_timeseries_graph()

    url = view.url(label='Timeseries graph example', time_range=[30, 33])
    print(url)

if __name__ == '__main__':
    main()
