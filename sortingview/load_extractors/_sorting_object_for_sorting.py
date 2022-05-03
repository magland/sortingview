import spikeinterface as si
import spikeinterface.extractors as se
import kachery_client as kc


def _sorting_object_for_sorting(sorting: si.BaseSorting):
    if hasattr(sorting, 'sortingview_object'):
        return sorting.sortingview_object
    elif isinstance(sorting, se.NwbSortingExtractor):
        file_path = sorting._file_path
        electrical_series_name = sorting._electrical_series_name
        sampling_frequency = sorting._sampling_frequency
        nwb_file_uri = kc.link_file(file_path)
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