"""
Optional figpack backend for sortingview.

When the environment variable SORTINGVIEW_BACKEND=figpack is set, View.url()
converts the sortingview view tree into the equivalent figpack views, uploads
the figure to figpack, and returns the figpack figure URL instead of a figurl
URL. Code that calls .url() (for example spyglass) does not need to change.

Environment variables
---------------------
SORTINGVIEW_BACKEND
    "figurl" (default) or "figpack".
SORTINGVIEW_FIGPACK_MODE
    "upload" (default): upload to figpack; requires FIGPACK_API_KEY.
    "ephemeral": upload as a temporary figure; no API key needed.
    "local": write the bundle to SORTINGVIEW_FIGPACK_LOCAL_DIR (or a temp dir)
             and return the local directory path. For testing.
SORTINGVIEW_FIGPACK_STRICT
    "1": raise if any view in the tree has no figpack equivalent.
    Otherwise (default) warn and fall back to figurl for that figure.
FIGPACK_API_KEY, FIGPACK_BUCKET, FIGPACK_API_BASE_URL
    Passed through to figpack. Use a bucket whose figures do not expire if the
    URL will be stored in a database.

Requires: pip install figpack figpack_spike_sorting
(and figpack_franklab for the Frank Lab track animation and 1D decoded
position views).

Legacy SpikeSortingView.Figure objects (create_raw_traces_plot, and the
MountainLayout figures spyglass v0 builds from them) are converted too.
"""

import base64
import json
import os
import tempfile
import urllib.error
import urllib.request
import warnings
from typing import Any, Dict, Optional, Union

import numpy as np


class UnsupportedViewError(Exception):
    """Raised when a sortingview view has no figpack equivalent."""


def backend() -> str:
    return os.environ.get("SORTINGVIEW_BACKEND", "figurl").strip().lower()


def use_figpack() -> bool:
    return backend() == "figpack"


def _strict() -> bool:
    return os.environ.get("SORTINGVIEW_FIGPACK_STRICT", "0") == "1"


def _j(x):
    """Convert numpy scalars/arrays (recursively) to plain Python for JSON-bound fields.

    figurl's serializer accepted numpy types; figpack json.dumps some fields directly.
    """
    if isinstance(x, np.generic):
        return x.item()
    if isinstance(x, np.ndarray):
        return x.tolist()
    if isinstance(x, dict):
        return {_j(k): _j(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [_j(v) for v in x]
    return x


# ---------------------------------------------------------------------------
# Conversion
# ---------------------------------------------------------------------------


def to_figpack(view):
    """Convert a sortingview View (and its children) into a figpack view.

    Raises UnsupportedViewError if any view in the tree has no equivalent.
    """
    import figpack.views as fpv

    from .views import (
        Autocorrelograms,
        AverageWaveforms,
        Box,
        CrossCorrelograms,
        ElectrodeGeometry,
        Image,
        Markdown,
        MountainLayout,
        PlotlyFigure,
        RasterPlot,
        SortingCuration2,
        SortingSummary,
        SpikeAmplitudes,
        SpikeLocations,
        Splitter,
        TabLayout,
        TiledImage,
        TimeseriesGraph,
        UnitLocations,
        UnitMetricsGraph,
        UnitSimilarityMatrix,
        UnitsTable,
    )

    # ---- layouts (figpack core) ----
    if isinstance(view, Box):
        return fpv.Box(
            direction=view._direction,
            show_titles=bool(view._show_titles),
            items=[_layout_item(it) for it in view._items],
        )
    if isinstance(view, Splitter):
        return fpv.Splitter(
            direction=view._direction,
            item1=_layout_item(view._items[0]),
            item2=_layout_item(view._items[1]),
        )
    if isinstance(view, MountainLayout):
        return fpv.MountainLayout(
            items=[
                fpv.MountainLayoutItem(
                    label=it.label,
                    view=to_figpack(it.view),
                    is_control=bool(it.is_control),
                    control_height=it.control_height,
                )
                for it in view._items
            ]
        )
    if isinstance(view, TabLayout):
        return fpv.TabLayout(items=[fpv.TabLayoutItem(label=it.label, view=to_figpack(it.view)) for it in view._items])

    # ---- simple views (figpack core) ----
    if isinstance(view, Markdown):
        return fpv.Markdown(view._source)
    if isinstance(view, PlotlyFigure):
        return fpv.PlotlyFigure(view._fig)
    if isinstance(view, Image):
        return _convert_image(view)
    if isinstance(view, TimeseriesGraph):
        return _convert_timeseries_graph(view)
    from .views import PositionPlot

    if isinstance(view, PositionPlot):
        return _convert_position_plot(view)

    # ---- spike sorting views (figpack_spike_sorting) ----
    if isinstance(
        view,
        (
            Autocorrelograms,
            AverageWaveforms,
            CrossCorrelograms,
            ElectrodeGeometry,
            RasterPlot,
            SortingCuration2,
            SortingSummary,
            SpikeAmplitudes,
            SpikeLocations,
            TiledImage,
            UnitLocations,
            UnitMetricsGraph,
            UnitSimilarityMatrix,
            UnitsTable,
        ),
    ):
        return _convert_spike_sorting_view(view)

    # ---- Frank Lab views (figpack_franklab) ----
    from .views.franklab import DecodedLinearPositionData, TrackPositionAnimationV1

    if isinstance(view, TrackPositionAnimationV1):
        return _convert_track_animation(view)
    if isinstance(view, DecodedLinearPositionData):
        return _convert_decoded_linear_position(view)

    raise UnsupportedViewError(f"No figpack equivalent for sortingview view type {type(view).__name__}")


_COLOR_CYCLE = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]


def _convert_position_plot(view):
    """PositionPlot (position vs. time, one trace per dimension) -> TimeseriesGraph."""
    import figpack.views as fpv

    from .views.PositionPlot import _get_subsample_inds

    timestamps = np.asarray(view.timestamps, dtype=np.float64)
    positions = np.asarray(view.positions)
    if positions.ndim == 1:
        positions = positions.reshape(-1, 1)
    if view.subsampling_frequency is not None:
        inds = _get_subsample_inds(timestamps, view.subsampling_frequency)
        timestamps = timestamps[inds]
        positions = positions[inds, :]
    G = fpv.TimeseriesGraph(y_label="Position")
    for i, label in enumerate(view.dimension_labels):
        color = _COLOR_CYCLE[i % len(_COLOR_CYCLE)]
        y = positions[:, i].astype(np.float32)
        if view.discontinuous:
            G.add_marker_series(name=str(label), t=timestamps, y=y, color=color, radius=2)
        else:
            G.add_line_series(name=str(label), t=timestamps, y=y, color=color)
    return G


def _convert_decoded_linear_position(view):
    try:
        from figpack_franklab.views import DecodedLinearPosition
    except Exception as e:  # ImportError, or FileNotFoundError when its JS bundle is missing
        raise UnsupportedViewError(f"DecodedLinearPositionData requires figpack_franklab with DecodedLinearPosition ({e})") from e

    sampling_frequency = view.sampling_frequency
    if sampling_frequency is None:
        sampling_frequency = 1000.0  # sortingview's frontend default
    return DecodedLinearPosition(
        values=np.asarray(view.values),
        positions=np.asarray(view.positions),
        frame_bounds=np.asarray(view.frame_bounds),
        positions_key=np.asarray(view.positions_key),
        start_time_sec=float(view.start_time_sec),
        sampling_frequency_hz=float(sampling_frequency),
        observed_positions=getattr(view, "observed_positions", None),
    )


# ---------------------------------------------------------------------------
# Legacy sortingview.SpikeSortingView.Figure (data dicts, no View classes)
# ---------------------------------------------------------------------------


def legacy_figure_to_figpack(figure):
    """Convert a legacy SpikeSortingView.Figure (e.g. from create_raw_traces_plot)."""
    return _convert_legacy_data(figure.data, label=figure.label)


def _convert_legacy_data(data: dict, *, label: str):
    import figpack.views as fpv

    t = data.get("type")
    if t == "RawTracesPlot":
        traces = np.asarray(data["traces"], dtype=np.float32)
        if traces.ndim == 1:
            traces = traces.reshape(-1, 1)
        # MultiChannelTimeseries stacks the channels, like sortingview's raw traces plot
        return fpv.MultiChannelTimeseries(
            start_time_sec=float(data["startTimeSec"]),
            sampling_frequency_hz=float(data["samplingFrequency"]),
            data=traces,
            channel_ids=[f"ch {i}" for i in range(traces.shape[1])],
            y_label="Voltage",
        )
    if t == "ElectrodeGeometry":
        return fpv.MatplotlibFigure(_electrode_geometry_figure(_j(data["channelLocations"])))
    if t == "MountainLayout":
        items = []
        for v in data.get("views", []):
            child = _resolve_legacy_child(v)
            items.append(fpv.MountainLayoutItem(label=v.get("label", child[1]), view=_convert_legacy_data(child[0], label=child[1])))
        return fpv.MountainLayout(items=items)
    raise UnsupportedViewError(f"No figpack equivalent for legacy figure type {t!r}")


def _resolve_legacy_child(v: dict):
    """Find a legacy MountainLayout child's data.

    The layout only holds a kachery reference to each child's serialized data.
    Prefer the live Figure object created in this process (matched by type and
    label); otherwise load and deserialize the stored data.
    """
    from .SpikeSortingView.Figure import find_live_figure

    fig = find_live_figure(type=v.get("type"), label=v.get("label"))
    if fig is not None:
        return fig.data, fig.label
    uri = v.get("figureDataUri") or (f"sha1://{v['figureDataSha1']}" if v.get("figureDataSha1") else None)
    if uri is None:
        raise UnsupportedViewError("Legacy MountainLayout child has no data reference")
    from figurl.core.serialize_wrapper import _deserialize

    try:
        import kachery_cloud as kcl  # spyglass stores children with kachery_cloud

        stored = kcl.load_json(uri)
    except ImportError:
        import kachery as ka

        stored = ka.load_json(uri)
    if stored is None:
        raise UnsupportedViewError(f"Could not load legacy figure data {uri}")
    return _deserialize(stored), v.get("label", "")


def _layout_item(it):
    import figpack.views as fpv

    return fpv.LayoutItem(
        to_figpack(it.view),
        stretch=it.stretch,
        min_size=it.min_size,
        max_size=it.max_size,
        title=it.title,
        collapsible=bool(it.collapsible),
    )


def _convert_image(view):
    import figpack.views as fpv

    url = view._url
    prefix = "base64,"
    if url.startswith("data:") and prefix in url:
        return fpv.Image(base64.b64decode(url[url.index(prefix) + len(prefix) :]))
    raise UnsupportedViewError("Image views that reference a remote URL are not supported by the figpack backend")


def _convert_timeseries_graph(view):
    import figpack.views as fpv

    kwargs: Dict[str, Any] = {}
    if view._legend_opts is not None:
        kwargs["legend_opts"] = view._legend_opts
    if view._y_range is not None:
        kwargs["y_range"] = list(view._y_range)
    if view._hide_x_gridlines is not None:
        kwargs["hide_x_gridlines"] = bool(view._hide_x_gridlines)
    if view._hide_y_gridlines is not None:
        kwargs["hide_y_gridlines"] = bool(view._hide_y_gridlines)
    G = fpv.TimeseriesGraph(**kwargs)

    datasets = {ds._name: ds._data for ds in view._datasets}
    offset = view._time_offset

    def _t(arr):
        arr = np.asarray(arr)
        if offset is not None:
            # sortingview subtracts an offset to fit float32; restore absolute time
            arr = arr.astype(np.float64) + float(offset)
        return arr

    for s in view._series:
        data = datasets[s._dataset]
        t = _t(data[s._encoding["t"]])
        y = np.asarray(data[s._encoding["y"]])
        attrs = s._attributes or {}
        name = s._title or s._dataset
        color = attrs.get("color", "blue")
        if s._type == "line":
            kw = {}
            if "width" in attrs:
                kw["width"] = attrs["width"]
            if "dash" in attrs:
                kw["dash"] = attrs["dash"]
            G.add_line_series(name=name, t=t, y=y, color=color, **kw)
        elif s._type == "marker":
            kw = {}
            if "radius" in attrs:
                kw["radius"] = attrs["radius"]
            if "shape" in attrs:
                kw["shape"] = attrs["shape"]
            G.add_marker_series(name=name, t=t, y=y, color=color, **kw)
        elif s._type == "interval":
            # sortingview stores intervals interleaved: t = [s0, e0, s1, e1, ...]
            G.add_interval_series(name=name, t_start=t[0::2], t_end=t[1::2], color=color)
        else:
            raise UnsupportedViewError(f"TimeseriesGraph series type {s._type!r} is not supported")
    return G


def _convert_spike_sorting_view(view):
    import figpack.views as fpv
    import figpack_spike_sorting.views as ssv

    from . import views as vv

    if isinstance(view, vv.Autocorrelograms):
        return ssv.Autocorrelograms(
            autocorrelograms=[
                ssv.AutocorrelogramItem(unit_id=_j(a.unit_id), bin_edges_sec=a.bin_edges_sec, bin_counts=a.bin_counts) for a in view._autocorrelograms
            ]
        )
    if isinstance(view, vv.CrossCorrelograms):
        return ssv.CrossCorrelograms(
            cross_correlograms=[
                ssv.CrossCorrelogramItem(unit_id1=_j(c.unit_id1), unit_id2=_j(c.unit_id2), bin_edges_sec=c.bin_edges_sec, bin_counts=c.bin_counts)
                for c in view._cross_correlograms
            ],
            hide_unit_selector=bool(view._hide_unit_selector),
        )
    if isinstance(view, vv.AverageWaveforms):
        return ssv.AverageWaveforms(
            average_waveforms=[
                ssv.AverageWaveformItem(
                    unit_id=_j(a.unit_id),
                    channel_ids=_j(a.channel_ids),
                    waveform=a.waveform,
                    waveform_std_dev=a.waveform_std_dev,
                    waveform_percentiles=a.waveform_percentiles,
                )
                for a in view._average_waveforms
            ],
            channel_locations=_j(view._channel_locations),
        )
    if isinstance(view, vv.RasterPlot):
        return ssv.RasterPlot(
            start_time_sec=view._start_time_sec,
            end_time_sec=view._end_time_sec,
            plots=[ssv.RasterPlotItem(unit_id=_j(p.unit_id), spike_times_sec=p.spike_times_sec) for p in view._plots],
        )
    if isinstance(view, vv.SpikeAmplitudes):
        return ssv.SpikeAmplitudes(
            start_time_sec=view._start_time_sec,
            end_time_sec=view._end_time_sec,
            plots=[
                ssv.SpikeAmplitudesItem(unit_id=_j(p.unit_id), spike_times_sec=p.spike_times_sec, spike_amplitudes=p.spike_amplitudes)
                for p in view._plots
            ],
        )
    if isinstance(view, vv.SpikeLocations):
        return ssv.SpikeLocations(
            units=[
                ssv.SpikeLocationsItem(unit_id=_j(u.unit_id), spike_times_sec=u.spike_times_sec, x_locations=u.x_locations, y_locations=u.y_locations)
                for u in view._units
            ],
            x_range=view._x_range,
            y_range=view._y_range,
            channel_locations=_j(view._channel_locations),
            hide_unit_selector=bool(view._hide_unit_selector),
            disable_auto_rotate=bool(view._disable_auto_rotate),
        )
    if isinstance(view, vv.UnitLocations):
        return ssv.UnitLocations(
            units=[ssv.UnitLocationsItem(unit_id=_j(u.unit_id), x=_j(u.x), y=_j(u.y)) for u in view._units],
            channel_locations=_j(view._channel_locations),
            disable_auto_rotate=bool(view._disable_auto_rotate),
        )
    if isinstance(view, vv.UnitsTable):
        return ssv.UnitsTable(
            columns=[ssv.UnitsTableColumn(key=c.key, label=c.label, dtype=c.dtype) for c in view._columns],
            rows=[ssv.UnitsTableRow(unit_id=_j(r.unit_id), values=_j(r.values)) for r in view._rows],
            similarity_scores=_similarity_scores(view._similarity_scores),
        )
    if isinstance(view, vv.UnitSimilarityMatrix):
        return ssv.UnitSimilarityMatrix(unit_ids=_j(view._unit_ids), similarity_scores=_similarity_scores(view._similarity_scores))
    if isinstance(view, vv.UnitMetricsGraph):
        return ssv.UnitMetricsGraph(
            units=[ssv.UnitMetricsGraphUnit(unit_id=_j(u.unit_id), values=_j(u.values)) for u in view._units],
            metrics=[ssv.UnitMetricsGraphMetric(key=m.key, label=m.label, dtype=m.dtype) for m in view._metrics],
        )
    if isinstance(view, vv.TiledImage):
        return ssv.TiledImage(
            tile_size=view._tile_size,
            layers=[ssv.TiledImageLayer(label=layer.label, data=layer.data) for layer in view._layers],
            verbose=view._verbose,
        )
    if isinstance(view, vv.SortingCuration2):
        kwargs = {}
        if view._label_choices is not None:
            kwargs["default_label_options"] = list(view._label_choices)
        return ssv.SortingCuration(**kwargs)

    # ---- stand-ins until figpack_spike_sorting has these views ----
    if isinstance(view, vv.SortingSummary):
        return fpv.Markdown(_sorting_summary_markdown(view))
    if isinstance(view, vv.ElectrodeGeometry):
        # figpack's UnitLocations viewer rejects an empty unit list, so draw the layout with matplotlib
        return fpv.MatplotlibFigure(_electrode_geometry_figure(_j(view.channel_locations)))

    raise UnsupportedViewError(f"No figpack equivalent for {type(view).__name__}")


def _similarity_scores(scores):
    if scores is None:
        return None
    import figpack_spike_sorting.views as ssv

    return [ssv.UnitSimilarityScore(unit_id1=_j(s.unit_id1), unit_id2=_j(s.unit_id2), similarity=_j(s.similarity)) for s in scores]


def _electrode_geometry_figure(channel_locations: dict):
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(4, 6))
    ids = list(channel_locations.keys())
    xy = np.array([channel_locations[k][:2] for k in ids], dtype=float).reshape(-1, 2)
    ax.scatter(xy[:, 0], xy[:, 1], s=60, marker="s", color="#888")
    for k, (x, y) in zip(ids, xy):
        ax.annotate(str(k), (x, y), textcoords="offset points", xytext=(6, 0), va="center", fontsize=8)
    ax.set_aspect("equal", adjustable="datalim")
    ax.set_xlabel("x (µm)")
    ax.set_ylabel("y (µm)")
    ax.set_title("Electrode geometry")
    fig.tight_layout()
    plt.close(fig)
    return fig


def _sorting_summary_markdown(view) -> str:
    duration_sec = view.num_frames / view.sampling_frequency if view.sampling_frequency else float("nan")
    lines = [
        "## Sorting summary",
        "",
        "| | |",
        "|---|---|",
    ]
    if view.recording_description:
        lines.append(f"| Recording | {view.recording_description} |")
    if view.sorting_description:
        lines.append(f"| Sorting | {view.sorting_description} |")
    lines += [
        f"| Units | {len(view.unit_ids)} |",
        f"| Channels | {len(view.channel_ids)} |",
        f"| Sampling frequency | {view.sampling_frequency:g} Hz |",
        f"| Duration | {duration_sec:.1f} s ({view.num_frames} frames, {view.num_segments} segment(s)) |",
        f"| Noise level | {view.noise_level:.3g} |",
    ]
    return "\n".join(lines)


def _convert_track_animation(view):
    try:
        from figpack_franklab.views import TrackAnimation
    except Exception as e:  # ImportError, or FileNotFoundError when its JS bundle is missing
        raise UnsupportedViewError(f"TrackPositionAnimationV1 requires a working figpack_franklab install ({e})") from e

    timestamps = np.asarray(view.timestamps)
    n = len(timestamps)
    head_direction = np.asarray(view.head_direction) if view.head_direction is not None else np.zeros(n, dtype=np.float32)
    d = view.decoded_data
    if d is not None:
        decoded = dict(
            bin_width=d.bin_width,
            bin_height=d.bin_height,
            xcount=int(d.x_count),
            ycount=int(d.y_count),
            xmin=d.x_min,
            ymin=d.y_min,
            values=np.asarray(d.values),
            locations=np.asarray(d.locations),
            frame_bounds=np.asarray(d.frame_bounds),
        )
    else:
        decoded = dict(
            bin_width=view.track_bin_width,
            bin_height=view.track_bin_height,
            xcount=0,
            ycount=0,
            xmin=view.x_min,
            ymin=view.y_min,
            values=np.zeros(0, dtype=np.uint8),
            locations=np.zeros(0, dtype=np.int32),
            frame_bounds=np.zeros(n, dtype=np.int32),
        )
    return TrackAnimation(
        **decoded,
        head_direction=head_direction,
        positions=np.asarray(view.positions),
        timestamps=timestamps,
        track_bin_corners=np.asarray(view.track_bin_ul_corners),
        sampling_frequency_hz=float(view.sampling_frequency_hz) if view.sampling_frequency_hz is not None else 60.0,
        timestamp_start=float(view.timestamp_start) if view.timestamp_start is not None else 0.0,
        total_recording_frame_length=int(view.total_recording_frame_length),
        track_bin_height=view.track_bin_height,
        track_bin_width=view.track_bin_width,
        xmax=view.x_max,
        ymax=view.y_max,
    )


# ---------------------------------------------------------------------------
# Curation
# ---------------------------------------------------------------------------


def _initial_curation_from_state(state: Optional[dict]) -> Optional[dict]:
    """figurl passes the starting curation as a URI in the URL state."""
    if not state:
        return None
    uri = state.get("sortingCuration") or state.get("initialSortingCuration")
    if not uri:
        return None
    return load_curation(uri)


def load_curation(uri_or_url: str) -> dict:
    """Load a sorting curation ({labelsByUnit, mergeGroups, ...}).

    Accepts a kachery URI (sha1://...), a GitHub URI (gh://...), or a figpack
    figure URL, in which case the curation saved in the figure is returned.
    """
    if uri_or_url.startswith("http://") or uri_or_url.startswith("https://"):
        base = uri_or_url.split("?")[0]
        if base.endswith("/index.html"):
            base = base[: -len("/index.html")]
        base = base.rstrip("/")
        try:
            with urllib.request.urlopen(f"{base}/annotations.json") as resp:
                saved = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code in (403, 404):
                return {}  # nothing saved yet
            raise
        text = saved.get("annotations", {}).get("/", {}).get("sorting_curation")
        return json.loads(text) if text else {}
    import kachery as ka

    return ka.load_json(uri_or_url)


def _annotations_json(curation: dict) -> dict:
    return {"annotations": {"/": {"sorting_curation": json.dumps(curation)}}}


# ---------------------------------------------------------------------------
# Publishing
# ---------------------------------------------------------------------------


def figpack_url(view, *, label: str, state: Union[dict, None] = None) -> str:
    """Convert a sortingview view to figpack, publish it, and return its URL."""
    fp_view = to_figpack(view)
    curation = _initial_curation_from_state(state)
    return publish(fp_view, title=label, initial_curation=curation)


def publish(fp_view, *, title: str, initial_curation: Optional[dict] = None) -> str:
    from figpack.core._bundle_utils import prepare_figure_bundle

    mode = os.environ.get("SORTINGVIEW_FIGPACK_MODE", "upload").strip().lower()
    if mode not in ("upload", "ephemeral", "local"):
        raise ValueError(f"Invalid SORTINGVIEW_FIGPACK_MODE: {mode!r}")

    if mode == "local":
        parent = os.environ.get("SORTINGVIEW_FIGPACK_LOCAL_DIR") or tempfile.gettempdir()
        os.makedirs(parent, exist_ok=True)
        out_dir = tempfile.mkdtemp(prefix="sortingview_figpack_", dir=parent)
        _write_bundle(prepare_figure_bundle, fp_view, out_dir, title, initial_curation)
        return out_dir

    from figpack.core._upload_bundle import _upload_bundle

    api_key = os.environ.get("FIGPACK_API_KEY")
    ephemeral = mode == "ephemeral"
    if not ephemeral and not api_key:
        raise EnvironmentError("SORTINGVIEW_BACKEND=figpack requires FIGPACK_API_KEY (or SORTINGVIEW_FIGPACK_MODE=ephemeral)")
    with tempfile.TemporaryDirectory(prefix="sortingview_figpack_") as tmpdir:
        _write_bundle(prepare_figure_bundle, fp_view, tmpdir, title, initial_curation)
        return _upload_bundle(tmpdir, api_key, title=title, ephemeral=ephemeral, use_consolidated_metadata_only=True)


def _write_bundle(prepare_figure_bundle, fp_view, out_dir: str, title: str, initial_curation: Optional[dict]):
    prepare_figure_bundle(fp_view, out_dir, title=title, description=f"Generated by sortingview ({title})")
    if initial_curation:
        # The figpack viewer loads <figure>/annotations.json on open; seeding it
        # here gives the figure its starting curation.
        with open(os.path.join(out_dir, "annotations.json"), "w") as f:
            json.dump(_annotations_json(initial_curation), f)


def try_figpack_url_legacy(figure) -> Optional[str]:
    """Like try_figpack_url, for a legacy SpikeSortingView.Figure."""
    try:
        fp_view = legacy_figure_to_figpack(figure)
    except UnsupportedViewError as e:
        if _strict():
            raise
        warnings.warn(f"sortingview: falling back to figurl ({e})")
        return None
    return publish(fp_view, title=figure.label)


def try_figpack_url(view, *, label: str, state: Union[dict, None] = None) -> Optional[str]:
    """Return a figpack URL, or None if the view tree can't be converted (non-strict mode)."""
    try:
        return figpack_url(view, label=label, state=state)
    except UnsupportedViewError as e:
        if _strict():
            raise
        warnings.warn(f"sortingview: falling back to figurl ({e})")
        return None
