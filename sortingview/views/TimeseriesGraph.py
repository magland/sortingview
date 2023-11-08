import numpy as np
from typing import List, Union, Dict, Any
from .View import View


class TGDataset:
    def __init__(self, *, name: str, data: dict) -> None:
        self._name = name
        self._data = data

    def to_dict(self):
        return {"name": self._name, "data": self._data}


class TGSeries:
    def __init__(self, *, type: str, dataset: str, encoding: dict, attributes: dict, title: str = "") -> None:
        self._type = type
        self._dataset = dataset
        self._encoding = encoding
        self._attributes = attributes
        self._title = title

    def to_dict(self):
        return {"type": self._type, "dataset": self._dataset, "encoding": self._encoding, "attributes": self._attributes, "title": self._title}


class TimeseriesGraph(View):
    def __init__(
        self,
        *,
        legend_opts: Union[None, dict] = None,
        y_range: Union[List[float], None] = None,
        hide_x_gridlines: Union[bool, None] = None,
        hide_y_gridlines: Union[bool, None] = None,
        **kwargs,
    ) -> None:
        super().__init__("TimeseriesGraph", **kwargs)
        self._datasets = []
        self._series = []
        self._legend_opts = legend_opts
        self._y_range = y_range
        # time_offset is used to allow float64 type in the time arrays
        self._time_offset = None
        self._hide_x_gridlines = hide_x_gridlines
        self._hide_y_gridlines = hide_y_gridlines

    def add_line_series(self, *, name: str, t: np.ndarray, y: np.ndarray, color: str, width: Union[None, int] = None, dash: Union[None, List[int]] = None):
        # allow float64 for time array
        t = self._handle_time_offset_t(t)

        if t.dtype == np.float64:
            raise Exception("Cannot handle float64 datatype for t parameter in add_line_series")
        if y.dtype == np.float64:
            raise Exception("Cannot handle float64 datatype for y parameter in add_line_series")

        attributes: Dict[str, Any] = {"color": color}
        if width is not None:
            attributes["width"] = width
        if dash is not None:
            attributes["dash"] = dash
        self._add_series(type="line", name=name, t=t, y=y, attributes=attributes)
        return self

    def add_marker_series(self, *, name: str, t: np.ndarray, y: np.ndarray, color: str, radius: Union[None, int] = None, shape: Union[None, str] = None):
        # allow float64 for time array
        t = self._handle_time_offset_t(t)

        if t.dtype == np.float64:
            raise Exception("Cannot handle float64 datatype for t parameter in add_marker_series")
        if y.dtype == np.float64:
            raise Exception("Cannot handle float64 datatype for y parameter in add_marker_series")
        attributes: Dict[str, Any] = {"color": color}
        if radius is not None:
            attributes["radius"] = radius
        if shape is not None:
            attributes["shape"] = shape
        self._add_series(type="marker", name=name, t=t, y=y, attributes=attributes)
        return self

    def add_interval_series(
        self,
        *,
        name: str,
        t_start: np.ndarray,
        t_end: np.ndarray,
        color: str,
    ):
        # allow float64 for time array
        t_start = self._handle_time_offset_t(t_start)
        t_end = self._handle_time_offset_t(t_end)

        if t_start.dtype == np.float64:
            raise Exception("Cannot handle float64 datatype for t_start parameter in add_interval_series")
        if t_end.dtype == np.float64:
            raise Exception("Cannot handle float64 datatype for t_end parameter in add_interval_series")
        attributes = {"color": color}
        t = np.zeros((len(t_start) * 2,), dtype=t_start.dtype)
        t[0::2] = t_start
        t[1::2] = t_end
        y = np.zeros((len(t_start) * 2,), dtype=np.int16)
        y[0::2] = 0
        y[1::2] = 1
        self._add_series(type="interval", name=name, t=t, y=y, attributes=attributes)
        return self

    def add_dataset(self, ds: TGDataset):
        self._datasets.append(ds)
        return self

    def add_series(self, s: TGSeries):
        self._series.append(s)
        return self

    def to_dict(self) -> dict:
        ret = {"type": self.type, "datasets": [ds.to_dict() for ds in self._datasets], "series": [s.to_dict() for s in self._series]}
        if self._time_offset is not None:
            ret["timeOffset"] = self._time_offset
        if self._legend_opts is not None:
            ret["legendOpts"] = self._legend_opts
        if self._y_range is not None:
            assert len(self._y_range) == 2
            ret["yRange"] = self._y_range
        if (self._hide_x_gridlines is not None) or (self._hide_y_gridlines is not None):
            ret["gridlineOpts"] = {"hideX": True if self._hide_x_gridlines is True else False, "hideY": True if self._hide_y_gridlines is True else False}
        return ret

    def child_views(self) -> List[View]:
        return []

    def _add_series(self, *, type: str, name: str, t: np.ndarray, y: np.ndarray, attributes: dict):
        if t.ndim != 1:
            print("WARNING: TimeseriesGraph::_add_series t argument is not 1D array. Using squeeze.")
            t = np.squeeze(t)
        if y.ndim != 1:
            print("WARNING: TimeseriesGraph::_add_series y argument is not 1D array. Using squeeze.")
            y = np.squeeze(y)
        ds = TGDataset(name=name, data={"t": t, "y": y})
        s = TGSeries(type=type, encoding={"t": "t", "y": "y"}, dataset=name, attributes=attributes, title=name)
        self.add_dataset(ds)
        self.add_series(s)

    def _handle_time_offset_t(self, t: np.ndarray):
        if t.dtype == np.float64:
            # We have a float64, let's see if we have a time offset
            if self._time_offset is None:
                # we don't, let's make one
                self._time_offset = t[0]
                # adjust the existing ones
                for ds in self._datasets:
                    if "t" in ds._data:
                        ds._data["t"] = (ds._data["t"] - self._time_offset).astype(np.float32)
        if self._time_offset is not None:
            # if we have a time offset, let's subtract it
            t = t - self._time_offset
            if t.dtype == np.float64:
                # if we have a float64, now that we've subtracted the time offset, it's safe to use float32
                t = t.astype(np.float32)
        return t
