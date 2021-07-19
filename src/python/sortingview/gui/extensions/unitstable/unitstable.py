import kachery_client as kc
import hither2 as hi
from sortingview.config.job_handler import job_handler
from sortingview.config.job_cache import job_cache

@hi.function('fetch_unit_metrics', '0.1.0')
def fetch_unit_metrics(unit_metrics_uri: str):
    return kc.load_json(unit_metrics_uri)

@kc.taskfunction('fetch_unit_metrics.1', type='pure-calculation')
def task_fetch_unit_metrics(unit_metrics_uri: str):
    with hi.Config(job_handler=job_handler.metrics, job_cache=job_cache):
        return fetch_unit_metrics.run(unit_metrics_uri=unit_metrics_uri)
