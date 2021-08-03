# Set external unit metrics for sorting

Here is an example script for setting external unit metrics for a sorting. Run the following script on the computer running the task backend.

```python
from typing import cast
import sortingview as sv

# Specify the workspace URI and the sorting ID
workspace_uri = '<|WORKSPACE_URI|>'
sorting_id = '<|SORTING_ID|>'

# Load the workspace
W = sv.load_workspace(workspace_uri)

# define external_metrics (this is just an example)
S = W.get_sorting(sorting_id)
sorting = sv.LabboxEphysSortingExtractor(S['sortingObject'])
unit_ids = sorting.get_unit_ids()
metric_name = 'example-metric'
metric_data = {}
for unit_id in unit_ids:
    metric_data[str(unit_id)] = len(cast(list, sorting.get_unit_spike_train(unit_id)))
external_metrics = [{'name': metric_name, 'label': metric_name, 'tooltip': metric_name, 'data': metric_data }]
#################################################################[#6](https://github.com/magland/sortingview/issues/6)

# Set the unit external unit metrics for the sorting
W.set_unit_metrics_for_sorting(sorting_id=sorting_id, metrics=external_metrics)
```