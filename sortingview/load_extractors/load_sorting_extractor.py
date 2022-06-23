from typing import Union
import kachery_cloud as kcl
import spikeinterface.extractors as se2


def load_sorting_extractor(sorting_object: Union[dict, str]):
    if isinstance(sorting_object, str):
        if sorting_object.startswith('sha1://') or sorting_object.startswith('ipfs://'):
            oo = kcl.load_json(sorting_object)
            return load_sorting_extractor(oo)
        else:
            raise Exception(f'Unexpected URI: {sorting_object}')
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
        firings_path = kcl.load_file(firings_uri, verbose=True)
        assert firings_path is not None
        samplerate = data.get('samplerate', None)
        if samplerate is None:
            raise Exception('samplerate is None')
        assert firings_path is not None, f'Unable to load firings file: {firings_uri}'
        sorting = se2.MdaSortingExtractor(firings_path, samplerate)
    elif sorting_format == 'nwb2':
        nwb_file_uri: str = data['nwb_file_uri']
        electrical_series_name: Union[str, None] = data.get('electrical_series_name', None)
        sampling_frequency: Union[float, None] = data.get('sampling_frequency', None)
        nwb_file_path = kcl.load_file(nwb_file_uri)
        if nwb_file_path is None:
            raise Exception(f'Unable to load nwb file: {nwb_file_uri}')
        sorting = se2.NwbSortingExtractor(file_path=nwb_file_path, electrical_series_name=electrical_series_name, sampling_frequency=sampling_frequency)
    elif sorting_format == 'npz':
        npz_file_uri: str = data['npz_file_uri']
        npz_file_path = kcl.load_file(npz_file_uri)
        if npz_file_path is None:
            raise Exception(f'Unable to load npz file: {npz_file_uri}')
        sorting = se2.NpzSortingExtractor(npz_file_path)
    else:
        raise Exception(f'Unexpected sorting format: {sorting_format}')
    setattr(sorting, 'sortingview_object', sorting_object)
    return sorting