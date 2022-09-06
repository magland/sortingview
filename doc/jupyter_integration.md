# Jupyter integration

You can also view sortingview widgets directly in Jupyter lab or Jupyter notebook. As with [local mode](./local_mode.md) and [electron mode](./electron_mode.md), no data goes to the cloud, and the front-end simply communicates with the python kernel. It uses the [ipywidgets](https://ipywidgets.readthedocs.io/en/stable/) mechanism.

After creating a view, simply use the following command in the notebook cell.

```
view.jupyter(height=800)
```

Alternatively, you can display the view in the cell as any other viewable jupyter object.

See [example notebook sortingview_jupyter.ipynb](../notebooks/sortingview_jupyter.ipynb)