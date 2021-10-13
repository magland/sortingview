from parcelsort import parcelsort
import sortingview as sv
import spikeextractors as se
from sortingview.extractors.subrecording import subrecording
from sortingview.extractors.subsorting import subsorting
from sortingview.helpers import prepare_snippets_h5

def main():
    R, S = example_recording_sorting()
    # channel ids are 192-223
    duration_min = 1
    R = subrecording(recording=R, start_frame=0, end_frame=30000*60*duration_min)
    S = subsorting(sorting=S, start_frame=0, end_frame=30000*60*duration_min)
    
    prepare_snippets_h5(
        recording_object=R.object(),
        sorting_object=S.object(),
        start_frame=None,
        end_frame=None,
        max_events_per_unit=None,
        max_neighborhood_size=15,
        snippet_len=(20, 20)
    )

def example_recording_sorting():
    recording_object = {"recording_format":"h5_v1","data":{"h5_uri":"sha1://1e2ec04b531ff5211febecf8691df3d141586f67/J1620210602_.nwb_raw data valid times first hour_25_franklab_default_cortex_recording.h5v1?manifest=618095f0b0db08aa3c33842d2b6b32a249f812e6"}}
    sorting_object = {"sorting_format":"h5_v1","data":{"h5_path":"sha1://ba179c03ffbd47877098b976b9e5dd140ea2a076/J1620210602_.nwb_raw data valid times first hour_25_franklab_default_cortex_sorting.h5v1?manifest=436ae9a9dca6abf9d9e0dc90a4a81f5ad0a716c3"}}
    R = sv.LabboxEphysRecordingExtractor(recording_object)
    S = sv.LabboxEphysSortingExtractor(sorting_object)
    return R, S

if __name__ == '__main__':
    main()