from typing import Dict
import numpy as np

def find_unit_neighborhoods(recording, peak_channels_by_unit, max_neighborhood_size) -> Dict[int, list]:
    channel_ids = recording.get_channel_ids()
    locations_by_channel = {}
    for ii, channel_id in enumerate(channel_ids):
        locations_by_channel[int(channel_id)] = np.array(recording.get_channel_property(channel_id=channel_id, property_name='location'))
    neighborhoods = {}
    for unit_id in peak_channels_by_unit.keys():
        if len(channel_ids) <= max_neighborhood_size:
            neighborhood_channel_ids = channel_ids
        else:
            peak_channel_id = peak_channels_by_unit[int(unit_id)]
            peak_location = locations_by_channel[int(peak_channel_id)]
            distances = []
            for channel_id in channel_ids:
                loc = locations_by_channel[int(channel_id)]
                dist = np.linalg.norm(np.array(loc) - np.array(peak_location))
                distances.append(dist)
            sorted_indices = np.argsort(distances)
            neighborhood_channel_ids = []
            for ii in range(min(max_neighborhood_size, len(channel_ids))):
                neighborhood_channel_ids.append(int(channel_ids[sorted_indices[ii]]))
        neighborhoods[int(unit_id)] = neighborhood_channel_ids
    return neighborhoods