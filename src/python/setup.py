from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
        'bin/sortingview-start-backend'
    ],
    install_requires=[
        'click',
        'hither>=0.7.0',
        'labbox-ephys>=0.7.1',
        'kachery-client>=1.0.6',
        'pynwb'
    ]
)
