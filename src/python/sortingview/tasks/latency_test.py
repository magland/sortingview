import kachery_client as kc

@kc.taskfunction('latency_test_query.1', type='query')
def task_latency_test_query(x: str):
    return x