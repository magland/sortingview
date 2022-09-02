from typing import List, Union
import numpy as np
from ..View import View


# /**
#  * @member xmin The minimum x-coordinate of the used bin centers, native units.
#  * @member binWidth Width of each bin, native units.
#  * @member xcount Number of bins accross to achieve the full extent
#  * @member ymin The minimum y-coordinate of the used bin centers, native units.
#  * @member binHeight Height of each bin, native units.
#  * @member ycount Number of bins down to achieve the full extent
#  * @member uniqueLocations Optional, To save browser-side computation, a list of all unique values in the locations array
#  * @member values Decoded scaled probability values 0-255 (corresponding to locations)
#  * @member locations Linearized integer positions of the sparse data. p0 = x0 + xcount * y0 --> center: [xmin + x0 * binWidth, ymin + y0 * binHeight]
#  * @member frameBounds: Array of entry counts, one for each time frame. Serves as an index for values/locations.
#  * The observations corresponding to timestamps[t] are values[sum(frameBounds[:t]):sum(frameBounds[:t]) + frameBounds[t]]
#  */
# export type DecodedPositionData = {
#     type______: 'DecodedPositionData'
#     xmin: number
#     binWidth: number
#     xcount: number
#     ymin: number
#     binHeight: number
#     ycount: number
#     uniqueLocations?: number[]
#     values: number[]
#     locations: number[]
#     frameBounds: number[]
# }
class DecodedPositionData:
    def __init__(self, *,
        x_min: float,
        bin_width: float,
        x_count: int,
        y_min: float,
        bin_height: float,
        y_count: int,
        values: np.array,
        locations: np.array,
        frame_bounds: np.array,
        unique_locations: Union[None, np.array]=None
    ) -> None:
        self.x_min = x_min
        self.bin_width = bin_width
        self.x_count = x_count
        self.y_min = y_min
        self.bin_height = bin_height
        self.y_count = y_count
        self.values = values
        self.locations = locations
        self.frame_bounds = frame_bounds
        self.unique_locations = unique_locations
    def to_dict(self) -> dict:
        ret = {
            'type': 'DecodedPositionData',
            'xmin': self.x_min,
            'binWidth': self.bin_width,
            'xcount': self.x_count,
            'ymin': self.y_min,
            'binHeight': self.bin_height,
            'ycount': self.y_count,
            'values': self.values,
            'locations': self.locations,
            'frameBounds': self.frame_bounds
        }
        if self.unique_locations is not None:
            ret['uniqueLocations'] = self.unique_locations
        return ret

# /**
#  * Data comprising a complete (non-streamed) track animation. The track itself is
#  * represented as a set of rectangles (a sparse subset of the full grid), and there are separate lists of timestamps
#  * and corresponding positions, as well as the track extrema and the
#  * optional sampling rate (number of frames per second in the recording - controls the base replay rate).
#  * 
#  * @member trackBinWidth The width of a single tile in the track, in native units. NOT
#  * the width of the overall track.
#  * @member trackBinHeight The height of a single tile in the track, in native units. NOT
#  * the height of the overall track.
#  * @member trackBinULCorners The upper-left corner of each tile in the constituent track,
#  * represented as an array of x-coordinates and an array of y-coordinates (i.e. number[2][:]).
#  * These are in the native units of the source data.
#  * @member timestampStart If set, this is the offset of the timestamp array, with the timestamps
#  * array representing elapsed time since the start of the recording. (This fixes resolution issues
#  * related to representing timestamps as floats rather than doubles.)
#  * @member timestamps Array of (float) timestamps which should align with the position list.
#  * The animal should be observed at position (positions[0][t], positions[1][t]) at time
#  * timestamps[t].
#  * @member positions Animal position at the aligned timestamp from timestamps, in native units.
#  * Represented as an array of x-coordinates and an array of y-coordinates.
#  * @member xmin Lowest x-value to display, in native units.
#  * @member xmax Highest x-value to display, in native units.
#  * @member ymin Lowest y-value to display, in native units.
#  * @member ymax Highest y-value to display, in native units.
#  * @member headDirection Direction of the animal's head in the xy-plane, in radians.
#  * @member decodedData The compressed sparse representation of decoded position data, as a DecodedPositionData object.
#  * @member samplingFrequencyHz Optional (Default 60), Sampling frequency of the recording - should coincide with 1/Delta_t where Delta_t is the mode of the timestamp deltas
#  */
# export type TrackAnimationStaticData = {
#     type_______: 'TrackAnimation'
#     trackBinWidth: number
#     trackBinHeight: number
#     trackBinULCorners: [number[], number[]]
#     totalRecordingFrameLength: number
#     timestampStart?: number
#     timestamps: number[]
#     positions: [number[], number[]]
#     xmin: number
#     xmax: number
#     ymin: number
#     ymax: number
#     headDirection?: number[]
#     decodedData?: DecodedPositionData
#     samplingFrequencyHz?: number
# }
class TrackPositionAnimationV1(View):
    """
    Track position animation
    """
    def __init__(self, *,
        track_bin_width: float,
        track_bin_height: float,
        track_bin_ul_corners: np.array, # 2 x N
        total_recording_frame_length: float,
        timestamp_start: Union[float, None]=None,
        timestamps: np.array, # N
        positions: np.array, # 2 x N
        x_min: float,
        x_max: float,
        y_min: float,
        y_max: float,
        head_direction: Union[None, np.array]=None, # N
        decoded_data: Union[None, DecodedPositionData]=None,
        sampling_frequency_hz: Union[None, float]=None,
        **kwargs
    ) -> None:
        super().__init__('TrackAnimation', **kwargs)
        self.track_bin_width = track_bin_width
        self.track_bin_height = track_bin_height
        self.track_bin_ul_corners = track_bin_ul_corners
        self.total_recording_frame_length = total_recording_frame_length
        self.timestamp_start = timestamp_start
        self.timestamps = timestamps
        self.positions = positions
        self.x_min = x_min
        self.x_max = x_max
        self.y_min = y_min
        self.y_max = y_max
        self.head_direction = head_direction
        self.decoded_data = decoded_data
        self.sampling_frequency_hz = sampling_frequency_hz
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'trackBinWidth': self.track_bin_width,
            'trackBinHeight': self.track_bin_height,
            'trackBinULCorners': self.track_bin_ul_corners,
            'totalRecordingFrameLength': self.total_recording_frame_length,
            'timestamps': self.timestamps,
            'positions': self.positions,
            'xmin': self.x_min,
            'xmax': self.x_max,
            'ymin': self.y_min,
            'ymax': self.y_max
        }
        if self.timestamp_start is not None:
            ret['timestampStart'] = self.timestamp_start
        if self.head_direction is not None:
            ret['headDirection'] = self.head_direction
        if self.decoded_data is not None:
            ret['decodedData'] = self.decoded_data.to_dict()
        if self.sampling_frequency_hz is not None:
            ret['samplingFrequencyHz'] = self.sampling_frequency_hz
        return ret
    def child_views(self) -> List[View]:
        return []
