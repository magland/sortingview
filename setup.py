from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
        'bin/sortingview-start-backend'
    ],
    include_package_data = True,
    install_requires=[
        'spikeinterface>=0.94.0',
        'spikeextractors>=0.9.9',
        'kachery-cloud>=0.1.13',
        'figurl>=0.2.4',
        'click',
        'pynwb',
        'pyyaml',
        'h5py',
        'google-auth',
        'cachecontrol'
    ]
)
