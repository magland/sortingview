from typing import Union
import kachery_client as kc
import kachery_cloud as kcl
import spikeinterface.extractors as se2


def load_sorting_extractor(sorting_object: dict):
    if 'firings' in sorting_object:
        return load_sorting_extractor(dict(
            sorting_format='mda',
            data=dict(
                firings=sorting_object['firings'],
                samplerate=sorting_object.get('samplerate', None)
            )
        ))
    sorting_format = sorting_object['sorting_format']
    data = sorting_object['data']
    if sorting_format == 'mda':
        firings_uri = data['firings']
        if firings_uri.startswith('ipfs://'):
            firings_path = kcl.load_file(firings_uri, verbose=True)
        else:
            firings_path = kc.load_file(firings_uri)
        samplerate = data.get('samplerate', None)
        if samplerate is None:
            raise Exception('samplerate is None')
        assert firings_path is not None, f'Unable to load firings file: {firings_uri}'
        sorting = se2.MdaSortingExtractor(firings_path, samplerate)
    elif sorting_format == 'nwb2':
        nwb_file_uri: str = data['nwb_file_uri']
        electrical_series_name: Union[str, None] = data.get('electrical_series_name', None)
        sampling_frequency: Union[float, None] = data.get('sampling_frequency', None)
        nwb_file_path = kc.load_file(nwb_file_uri)
        if nwb_file_path is None:
            raise Exception(f'Unable to load nwb file: {nwb_file_uri}')
        sorting = se2.NwbSortingExtractor(file_path=nwb_file_path, electrical_series_name=electrical_series_name, sampling_frequency=sampling_frequency)
    else:
        raise Exception(f'Unexpected sorting format: {sorting_format}')
    setattr(sorting, 'sortingview_object', sorting_object)
    return sorting