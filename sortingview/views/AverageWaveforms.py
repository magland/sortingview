import numpy as np
from typing import List, Union
from .View import View


class AverageWaveformItem:
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
    def __init__(self,
        average_waveforms: List[AverageWaveformItem]
    ) -> None:
        super().__init__('AverageWaveforms')
        self._average_waveforms = average_waveforms
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'averageWaveforms': [a.to_dict() for a in self._average_waveforms]
        }
        return ret
    def child_views(self) -> List[View]:
        return []
