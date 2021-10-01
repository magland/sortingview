import sortingview as sv
import seriesview as sev

def main():
    # Define the recording/sorting extractors
    R, S = example_recording_sorting()

    # Create a multipanel timeseries view
    MPV = sev.MultiPanelView()

    # Define a spike amplitudes object
    unit_id = 18
    V = sv.SpikeAmplitudes(recording=R, sorting=S, unit_id=unit_id, snippet_len=(20, 20)) # use a consistent snippet_len for purposes of caching
    
    # Add the panel
    MPV.add_event_amplitudes_panel(V.prepare_series(), label=f'Unit {unit_id}')

    # Print the figURL
    F = MPV.figurl()
    url = F.url(label='Spike amplitudes example')
    print(url)
        

def example_recording_sorting():
    x = {
        "recording_object": {
            "data": {
                "h5_uri": "sha1://159bf8a5a067fe2e6fa0ddd35875c48b4b677da8/despereaux20191125_.nwb_02_r1_13_franklab_default_hippocampus_recording.h5v1?manifest=15bda63463ee3f7eb29008b989f09f4b282b427d"
            },
            "recording_format": "h5_v1"
        },
        "sorting_object": {
            "data": {
                "h5_path": "sha1://e7854e34da661693ee758df4cb9401ef90488a50/despereaux20191125_.nwb_02_r1_13_franklab_default_hippocampus_sorting.h5v1"
            },
            "sorting_format": "h5_v1"
        }
    }
    R = sv.LabboxEphysRecordingExtractor(x['recording_object'])
    S = sv.LabboxEphysSortingExtractor(x['sorting_object'])
    return R, S

if __name__ == '__main__':
    main()