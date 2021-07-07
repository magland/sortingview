import os
from typing import Union
import labbox_ephys as le
import hither2 as hi
import kachery_client as kc


# ###################################################################################
# # preload_check_sorting_downloaded
# @hi.function('preload_check_sorting_downloaded', '0.1.0', register_globally=True)
# def preload_check_sorting_downloaded(labbox, sorting_object):
#     jh = labbox.get_job_handler('partition1')
#     with hi.Config(
#         job_handler=jh,
#         use_container=jh.is_remote()
#     ):
#         return preload_check_sorting_downloaded_2.run(sorting_object=sorting_object)

# @hi.function(
#     'preload_check_sorting_downloaded_2', '0.1.0',
#     image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
#     modules=['labbox_ephys']
# )
# def preload_check_sorting_downloaded_2(sorting_object):
#     import kachery_client as kc
#     try:
#         X = le.LabboxEphysSortingExtractor(sorting_object)
#     except:
#         return {'isLocal': False}
#     finally:
#         kp._experimental_config(nop2p=False)
#     return {'isLocal': True}

# ###################################################################################
# # preload_download_sorting
# @hi.function('preload_download_sorting', '0.1.0', register_globally=True)
# def preload_download_sorting(labbox, sorting_object):
#     jh = labbox.get_job_handler('partition1')
#     with hi.Config(
#         job_handler=jh,
#         use_container=jh.is_remote()
#     ):
#         return preload_download_sorting_2.run(sorting_object=sorting_object)

# @hi.function(
#     'preload_download_sorting_2', '0.1.0',
#     image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
#     modules=['labbox_ephys']
# )
# def preload_download_sorting_2(sorting_object):
#     import kachery_client as kc
#     try:
#         X = le.LabboxEphysSortingExtractor(sorting_object)
#     except:
#         return {'success': False}
#     return {'success': True}
    
# ###################################################################################
# # preload_check_recording_downloaded
# @hi.function('preload_check_recording_downloaded', '0.1.0', register_globally=True)
# def preload_check_recording_downloaded(labbox, recording_object):
#     jh = labbox.get_job_handler('partition1')
#     with hi.Config(
#         job_handler=jh,
#         use_container=jh.is_remote()
#     ):
#         return preload_check_recording_downloaded_2.run(recording_object=recording_object)

# @hi.function(
#     'preload_check_recording_downloaded_2', '0.1.0',
#     image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
#     modules=['labbox_ephys']
# )
# def preload_check_recording_downloaded_2(recording_object):
#     import kachery_client as kc
#     try:
#         kp._experimental_config(nop2p=True)
#         X = le.LabboxEphysRecordingExtractor(recording_object, download=False)
#     except:
#         return {'isLocal': False}
#     finally:
#         kp._experimental_config(nop2p=False)
#     return {'isLocal': True}

# ###################################################################################
# # preload_download_recording
# @hi.function('preload_download_recording', '0.1.0', register_globally=True)
# def preload_download_recording(labbox, recording_object):
#     jh = labbox.get_job_handler('partition1')
#     with hi.Config(
#         job_handler=jh,
#         use_container=jh.is_remote()
#     ):
#         return preload_download_recording_2.run(recording_object=recording_object)

# @hi.function(
#     'preload_download_recording_2', '0.1.0',
#     image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
#     modules=['labbox_ephys']
# )
# def preload_download_recording_2(recording_object):
#     import kachery_client as kc
#     try:
#         X = le.LabboxEphysRecordingExtractor(recording_object, download=True)
#     except:
#         return {'success': False}
#     return {'success': True}

# ###################################################################################
# # preload_extract_snippets
# @hi.function('preload_extract_snippets', '0.1.0', register_globally=True)
# def preload_extract_snippets(labbox, recording_object, sorting_object, snippet_len=(50, 80)):
#     from labbox_ephys import prepare_snippets_h5
#     jh = labbox.get_job_handler('partition2')
#     jc = labbox.get_job_cache()
#     with hi.Config(
#         job_cache=jc,
#         job_handler=jh,
#         use_container=jh.is_remote()
#     ):
#         snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object, snippet_len=snippet_len)
#         return snippets_h5