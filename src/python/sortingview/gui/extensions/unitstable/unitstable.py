import labbox_ephys as le
import kachery_client as kc
import hither2 as hi

@hi.function('createjob_fetch_unit_metrics', '0.1.0', register_globally=True)
def createjob_fetch_unit_metrics(labbox, unit_metrics_uri: str):
    return fetch_unit_metrics.run(unit_metrics_uri=unit_metrics_uri)

@hi.function('fetch_unit_metrics', '0.1.0')
def fetch_unit_metrics(unit_metrics_uri: str):
    return kc.load_json(unit_metrics_uri)
