import numpy as np
from typing import Any, Dict, List, Union
from .View import View


class AverageWaveformItem:
    """
    Single average waveform item (single box)

    Parameters
    ----------
    unit_id: int or str
        The unit ID
    channel_ids: list of int or str
        The channel IDs
    waveform: np.ndarray
        The average waveform (or template), (num_samples, num_channels)
    waveform_std_dev: np.ndarray or None, default: None
        The standard deviation of the template for each sample, (num_samples, num_channels)
    waveform_percentiles: list of np.array or None, default: None
        The percentiles to use for the shading. This argument is mutually exclusive with waveform_std_dev.
        If given, it must be a 2-element or 4-element list of np.array, where each array has shape (num_samples, num_channels).
        For example, if waveform_percentiles=[p1, p2], then the shaded region will be between p1 and p2.
        If waveform_percentiles=[p1, p2, p3, p4], a light shaded region will be between p1 and p4, and a
        darker one between p2 and p3.
    """

    def __init__(
        self,
        unit_id: Union[int, str],
        channel_ids: List[Union[int, str]],
        waveform: np.ndarray,
        waveform_std_dev: Union[None, np.ndarray] = None,
        waveform_percentiles: Union[None, List[np.ndarray]] = None,
    ) -> None:
        self.unit_id = unit_id
        self.channel_ids = channel_ids
        self.waveform = waveform

        assert waveform_std_dev is None or waveform_percentiles is None, "Cannot specify both waveform_std_dev and waveform_percentiles"
        self.waveform_std_dev = waveform_std_dev
        if waveform_percentiles is not None:
            assert len(waveform_percentiles) % 2 == 0, "waveform_percentiles must have even length"
        self.waveform_percentiles = waveform_percentiles

    def to_dict(self):
        ret = {"unitId": self.unit_id, "channelIds": self.channel_ids, "waveform": self.waveform}
        if self.waveform_std_dev is not None:
            ret["waveformStdDev"] = self.waveform_std_dev
        if self.waveform_percentiles is not None:
            ret["waveformPercentiles"] = self.waveform_percentiles
        return ret


class AverageWaveforms(View):
    """
    Average waveforms view
    """

    def __init__(
        self, average_waveforms: List[AverageWaveformItem], *, channel_locations: Union[None, Dict[str, Any]] = None, show_reference_probe: Union[None, bool] = None, **kwargs
    ) -> None:
        super().__init__("AverageWaveforms", **kwargs)
        self._average_waveforms = average_waveforms
        self._channel_locations = channel_locations
        self._show_reference_probe = show_reference_probe

    def to_dict(self) -> dict:
        ret = {"type": self.type, "averageWaveforms": [a.to_dict() for a in self._average_waveforms]}
        if self._channel_locations is not None:
            ret["channelLocations"] = self._channel_locations
        if self._show_reference_probe is not None:
            ret["showReferenceProbe"] = self._show_reference_probe
        return ret

    def child_views(self) -> List[View]:
        return []
