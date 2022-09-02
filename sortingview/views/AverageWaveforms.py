import numpy as np
from typing import Any, Dict, List, Union
from .View import View


class AverageWaveformItem:
    """
    Single average waveform item (single box)
    """
    def __init__(self,
        unit_id: Union[int, str],
        channel_ids: List[Union[int, str]],
        waveform: np.array,
        waveform_std_dev: Union[None, np.array]=None
    ) -> None:
        self.unit_id = unit_id
        self.channel_ids = channel_ids
        self.waveform = waveform
        self.waveform_std_dev = waveform_std_dev
    def to_dict(self):
        ret = {
            'unitId': self.unit_id,
            'channelIds': self.channel_ids,
            'waveform': self.waveform
        }
        if self.waveform_std_dev is not None:
            ret['waveformStdDev'] = self.waveform_std_dev
        return ret
class AverageWaveforms(View):
    """
    Average waveforms view
    """
    def __init__(self,
        average_waveforms: List[AverageWaveformItem], *,
        channel_locations: Union[None, Dict[str, Any]] = None,
        show_reference_probe: Union[None, bool]=None,
        **kwargs
    ) -> None:
        super().__init__('AverageWaveforms', **kwargs)
        self._average_waveforms = average_waveforms
        self._channel_locations = channel_locations
        self._show_reference_probe = show_reference_probe
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'averageWaveforms': [a.to_dict() for a in self._average_waveforms]
        }
        if self._channel_locations is not None:
            ret['channelLocations'] = self._channel_locations
        if self._show_reference_probe is not None:
            ret['showReferenceProbe'] = self._show_reference_probe
        return ret
    def child_views(self) -> List[View]:
        return []
