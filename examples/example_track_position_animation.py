# 7/14/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://9f52e595588458db2b029779110940cbba05cd20&label=Track%20position%20animation%20example

import numpy as np
import sortingview.views.franklab as vvf
import kachery_cloud as kcl


def main():
    kcl.use_sandbox()
    view = example_track_position_animation()

    url = view.url(label='Track position animation example')
    print(url)

def example_track_position_animation(*, height=800):
    num_frames = 2500
    sampling_frequency_hz = 10
    timestamps = np.arange(num_frames).astype(np.float32) / sampling_frequency_hz

    track_bin_ul_corners = np.array([
        [0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [5, 4]
    ]).astype(np.float32).T

    positions = []
    head_direction = []
    for i in range(num_frames):
        positions.append([5 + 3 * np.cos(i / 100 * 2 * np.pi), 5 + 3 * np.sin(i / 100 * 2 * np.pi)])
        head_direction.append(i / 20 * 2 * np.pi)
    positions = np.array(positions).T.astype(np.float32)
    head_direction = np.array(head_direction).astype(np.float32)

    x_count = 10
    y_count = 10
    x_locations = []
    y_locations = []
    values = []
    frame_bounds = []
    for i in range(num_frames):
        n = np.mod(i, 4)
        for j in range(n):
            x_locations.append(5 + j)
            y_locations.append(5)
            values.append(10 + j * 10)
        frame_bounds.append(n)
    x_locations = np.array(x_locations).astype(np.int32)
    y_locations = np.array(y_locations).astype(np.int32)
    values = np.array(values).astype(np.float32)
    frame_bounds = np.array(frame_bounds).astype(np.int32)

    locations = x_locations + x_count * y_locations
    decoded_position_data = vvf.DecodedPositionData(
        x_min=0,
        bin_width=1,
        x_count=x_count,
        y_min=0,
        bin_height=1,
        y_count=y_count,
        values=values,
        locations=locations,
        frame_bounds=frame_bounds
    )

    view = vvf.TrackPositionAnimationV1(
        track_bin_width=1,
        track_bin_height=1,
        track_bin_ul_corners=track_bin_ul_corners, # 2 x n
        total_recording_frame_length=len(timestamps),
        timestamp_start=0,
        timestamps=timestamps,
        positions=positions,
        x_min=-1,
        x_max=11,
        y_min=-1,
        y_max=11,
        head_direction=head_direction,
        decoded_data=decoded_position_data,
        sampling_frequency_hz=sampling_frequency_hz,
        height=height
    )
    return view

if __name__ == '__main__':
    main()
