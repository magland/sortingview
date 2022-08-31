from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
        'bin/sortingview-start-backend'
    ],
    include_package_data = True,
    install_requires=[
        'spikeinterface>=0.94.0',
        'kachery-cloud>=0.2.5',
        'figurl>=0.2.11',
        'click',
        'pynwb',
        'pyyaml',
        'h5py',
        'google-auth',
        'cachecontrol'
    ]
)
