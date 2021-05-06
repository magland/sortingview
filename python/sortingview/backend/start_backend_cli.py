import click
from .start_backend import start_backend

@click.command('sortingview-start-backend')
@click.option('--app-url', required=True, help="The URL of the web app")
@click.option('--label', required=True, help="A label for this backend provider")
def start_backend_cli(app_url: str, label: str):
    start_backend(app_url=app_url, label=label)