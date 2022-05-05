import os
import spikeinterface as si
import spikeinterface.extractors as se
import kachery_cloud as kcl


def get_sorting_object(sorting: si.BaseSorting):
    if hasattr(sorting, 'sortingview_object'):
        return sorting.sortingview_object
    elif isinstance(sorting, se.NwbSortingExtractor):
        file_path = sorting._file_path
        electrical_series_name = sorting._electrical_series_name
        sampling_frequency = sorting._sampling_frequency
        nwb_file_uri = kcl.store_file_local(file_path, label=os.path.basename(file_path), reference=True) # important to set reference=True
        sorting_object = {
            'sorting_format': 'nwb2',
            'data': {
                'nwb_file_uri': nwb_file_uri,
                'electrical_series_name': electrical_series_name,
                'sampling_frequency': sampling_frequency
            }
        }
    else:
        raise Exception('Unable to create sortingview object from sorting')
    setattr(sorting, 'sortingview_object', sorting_object)
    return sorting_object