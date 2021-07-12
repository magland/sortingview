from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
        'bin/sortingview-start-backend'
    ],
    include_package_data = True,
    install_requires=[
        'click',
        'hither>=0.7.0',
        'labbox-ephys>=0.7.2',
        'kachery-client>=1.0.8',
        'pynwb'
    ]
)
