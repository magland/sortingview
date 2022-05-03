import click
from .start_backend import start_backend

@click.command('sortingview-start-backend')
@click.option('--project', required=True, help="The kachery-cloud project ID")
@click.option('--backend-id', required=False, default='', help="The backend ID")
def start_backend_cli(project: str, backend_id: str):
    bid = backend_id if backend_id != '' else None
    start_backend(project_id=project, backend_id=bid)