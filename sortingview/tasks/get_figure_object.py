import kachery_client as kc

# @kc.taskfunction('sortingview.get_figure_object.1', type='pure-calculation')
def task_get_figure_object(figure_object_hash: str):
    # TODO: only load from local kachery storage and validate data prior to returning
    obj = kc.load_json('sha1://' + figure_object_hash)
    return obj