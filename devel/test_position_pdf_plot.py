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

    F2 = create_live_position_pdf_plot(
        pdf_object={
            'format': 'xarray',
            'uri': uri
        },
        start_time_sec=start_time_sec,
        end_time_sec=end_time_sec,
        sampling_frequency=sampling_frequency,
        num_positions=len(X.acausal_posterior.position.values),
        label='test live position pdf'
    )
    url2 = F2.url()
    print(url2)

if __name__ == '__main__':
    main()