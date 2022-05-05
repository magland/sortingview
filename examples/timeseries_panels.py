# 5/5/22
# https://www.figurl.org/f?v=gs://figurl/spikesortingview-2&d=ipfs://bafkreictlxjsm5c35hz5gs4x4z6e3k5wumcqujytabfygjceecfowdx7li&project=siojtbyvbw&label=Jaq_03_12_visualization_data

import numpy as np
import kachery_cloud as kcl
import json
import hashlib
from math import ceil, floor

from sortingview.SpikeSortingView import create_position_plot, MultiTimeseries, create_live_position_pdf_plot, create_spike_raster_plot

def main():
    uri = 'ipfs://bafybeibixnwjoxoc5fhhfesvfixsuxc2fsdstd4dknqkmkbu6wdewmofre?label=Jaq_03_12_visualization_data.npy'
    print(f'Loading {uri}')
    fname = kcl.load_file(uri)
    X = np.load(fname, allow_pickle=True)

    print('Creating views...')
    layout = MultiTimeseries(label='Jaq_03_12_visualization_data')

    a = X[2]
    assert a['type'] == 'spikes'
    spike_times = a['spike_times'].astype(np.float32)
    cell_ids = a['cell_id'].astype(np.int32)
    F = create_spike_raster_plot(
        times=spike_times,
        labels=cell_ids,
        label='Spikes'
    )
    layout.add_panel(F, relative_height=4)

    a = X[3]
    assert a['type'] == 'linear_position'
    time = a['time'].astype(np.float32)
    data = a['data'].astype(np.float32)
    F = create_position_plot(
        timestamps=time,
        positions=data,
        dimension_labels=['Linear position'],
        label='Linear position',
        discontinuous=True
    )
    layout.add_panel(F, relative_height=2)

    a = X[4]
    assert a['type'] == 'speed'
    time = a['time'].astype(np.float32)
    data = a['data'].astype(np.float32)
    units = a['units']
    F = create_position_plot(
        timestamps=time,
        positions=data,
        dimension_labels=['Speed'],
        label='Speed',
        discontinuous=False
    )
    layout.add_panel(F)

    a = X[6]
    assert a['type'] == 'decoded_position_probability'
    time = a['time'].astype(np.float32)
    data = a['data'].astype(np.float32)
    units = a['units']
    segment_size = 100000
    multiscale_factor = 3
    h5_uri = create_live_position_pdf_plot_h5(data=data, segment_size=segment_size, multiscale_factor=multiscale_factor)
    F = create_live_position_pdf_plot(
        start_time_sec=time[0],
        end_time_sec=time[-1],
        sampling_frequency=(len(time) - 1) / (time[-1] - time[0]),
        num_positions=data.shape[1],
        pdf_object={
            'format': 'position_pdf_h5_v1',
            'uri': h5_uri
        },
        segment_size=segment_size,
        multiscale_factor=multiscale_factor,
        label='Position probability'
    )
    layout.add_panel(F, relative_height=3)

    F = layout.get_composite_figure()
    url = F.url()
    print(url)

def create_live_position_pdf_plot_h5(*, data: np.array, segment_size: int, multiscale_factor: int):
    data_uri = kcl.store_npy_local(data)
    key_obj = {
        'type': 'live_position_plot_h5',
        'version': 5,
        'data_uri': data_uri,
        'segment_size': segment_size,
        'multiscale_factor': multiscale_factor
    }
    key = f'live_position_pdf_plot/{_sha1_of_object(key_obj)}'
    a = kcl.get_mutable_local(key)
    if a and kcl.load_file(a):
        return a
    
    import h5py
    num_times = data.shape[0]
    num_positions = data.shape[1]

    def fetch_segment(istart: int, iend: int):
        return np.nan_to_num(data[istart:iend])

    with kcl.TemporaryDirectory() as tmpdir:
        output_file_name = tmpdir + '/live_position_pdf_plot.h5'
        with h5py.File(output_file_name, 'w') as f:
            downsample_factor = 1
            while downsample_factor < num_times:
                num_segments = ceil(floor(num_times / downsample_factor) / segment_size)
                for iseg in range(num_segments):
                    i1 = iseg * segment_size
                    i2 = min(i1 + segment_size, floor(num_times / downsample_factor))
                    if downsample_factor == 1:
                        A = fetch_segment(istart=i1, iend=i2)
                        B = A / np.reshape(np.repeat(np.max(A, axis=1), A.shape[1]), A.shape)
                        B = (B * 100).astype(np.uint8)
                    else:
                        prev_downsample_factor = floor(downsample_factor / multiscale_factor)
                        B_prev_list = [
                            np.array(f.get(f'segment/{prev_downsample_factor}/{iseg * multiscale_factor + offset}'))
                            for offset in range(multiscale_factor)
                            if (iseg * multiscale_factor + offset) * segment_size * prev_downsample_factor < num_times
                        ]
                        B_prev = np.concatenate(B_prev_list, axis=0).astype(np.float32)
                        N_prev = B_prev.shape[0]
                        if N_prev % multiscale_factor != 0:
                            N_prev = floor(N_prev / multiscale_factor) * multiscale_factor
                            B_prev = B_prev[:N_prev]
                        B: np.ndarray = np.mean(np.reshape(B_prev, (floor(N_prev / multiscale_factor), multiscale_factor, num_positions)), axis=1)
                        B = B / np.reshape(np.repeat(np.max(B, axis=1), B.shape[1]), B.shape)
                        B = np.floor(B).astype(np.uint8)
                    print('Creating', f'segment/{downsample_factor}/{iseg}')
                    f.create_dataset(f'segment/{downsample_factor}/{iseg}', data=B)
                downsample_factor *= multiscale_factor
    
        h5_uri = kcl.store_file_local(output_file_name)
        kcl.set_mutable_local(key, h5_uri)
        return h5_uri

def _sha1_of_string(txt: str) -> str:
    hh = hashlib.sha1(txt.encode('utf-8'))
    ret = hh.hexdigest()
    return ret

def _sha1_of_object(obj: object) -> str:
    txt = json.dumps(obj, sort_keys=True, separators=(',', ':'))
    return _sha1_of_string(txt)

if __name__ == '__main__':
    main()