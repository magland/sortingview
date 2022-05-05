from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
        'bin/sortingview-start-backend'
    ],
    include_package_data = True,
    install_requires=[
        'spikeinterface>=0.94.0'
        'spikeextractors>=0.9.9',
        'kachery-cloud>=0.1.11'
        'figurl2>=0.1.6',
        'click',
        'pynwb',
        'pyyaml',
        'h5py'
    ]
)
