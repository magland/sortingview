import numpy as np
from math import ceil, floor
import kachery_client as kc
from sortingview.experimental.SpikeSortingView import create_position_pdf_plot, create_live_position_pdf_plot
import xarray as xr

def main():
    uri = 'sha1://c3016c93fe15dfa19f8ab5e669056d783799ddb1/Jaq_03_02_clusterless_forward_reverse_results.nc?manifest=cde2e2d521acde2b65b55d7aa5e83c86607ff5fe'
    X = xr.open_dataset(kc.load_file(uri))
    n = 100000
    a = X.acausal_posterior.isel(time=slice(0, n)).sum('state')
    time_coord = a.time.values
    # position_coord = a.position.values
    pdf = a.values

    # time_coord = time_coord[::4]
    # pdf = pdf[::4]

    F = create_position_pdf_plot(
        pdf=pdf,
        start_time_sec=min(time_coord),
        sampling_frequency=1/(time_coord[1] - time_coord[0]),
        label='test position pdf'
    )
    url = F.url()
    print(url)

    
    start_time_sec = X.acausal_posterior.time.values[0]
    end_time_sec = X.acausal_posterior.time.values[-1]
    dt = X.acausal_posterior.time.values[1] - X.acausal_posterior.time.values[0]
    sampling_frequency = 1 / dt

    segment_size = 100000
    multiscale_factor = 3
    h5_uri = create_live_position_pdf_plot_h5(uri=uri, segment_size=segment_size, multiscale_factor=multiscale_factor)

    F2 = create_live_position_pdf_plot(
        pdf_object={
            'format': 'position_pdf_h5_v1',
            'uri': h5_uri
        },
        start_time_sec=start_time_sec,
        end_time_sec=end_time_sec,
        sampling_frequency=sampling_frequency,
        num_positions=len(X.acausal_posterior.position.values),
        segment_size=segment_size,
        multiscale_factor=multiscale_factor,
        label='test live position pdf'
    )
    url2 = F2.url()
    print(url2)

def create_live_position_pdf_plot_h5(*, uri: str, segment_size: int, multiscale_factor: int):
    key = {
        'type': 'live_position_plot_h5',
        'version': 1,
        'uri': uri,
        'segment_size': segment_size,
        'multiscale_factor': multiscale_factor
    }
    a = kc.get(key)
    if a and kc.load_file(a):
        return a
    
    import h5py
    fname = kc.load_file(uri)
    X = xr.open_dataset(fname)
    num_times = X.acausal_posterior.shape[0]
    num_positions = X.acausal_posterior.shape[2]

    with kc.TemporaryDirectory() as tmpdir:
        output_file_name = tmpdir + '/live_position_pdf_plot.h5'
        with h5py.File(output_file_name, 'w') as f:
            downsample_factor = 1
            while downsample_factor < num_times:
                num_segments = ceil(floor(num_times / downsample_factor) / segment_size)
                for iseg in range(num_segments):
                    i1 = iseg * segment_size
                    i2 = min(i1 + segment_size, floor(num_times / downsample_factor))
                    if downsample_factor == 1:
                        A = X.acausal_posterior.isel(time=slice(i1, i2)).sum('state').values
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
                        B = np.floor(B).astype(np.uint8)
                    print('Creating', f'segment/{downsample_factor}/{iseg}')
                    f.create_dataset(f'segment/{downsample_factor}/{iseg}', data=B)
                downsample_factor *= multiscale_factor
    
        h5_uri = kc.store_file(output_file_name)
        kc.set(key, h5_uri)
        return h5_uri

if __name__ == '__main__':
    main()