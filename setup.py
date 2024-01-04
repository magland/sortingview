from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
    ],
    include_package_data = True,
    install_requires=[
        'spikeinterface>=0.97.0',
        'kachery-cloud>=0.4.0',
        'figurl>=0.2.22',
        'matplotlib',
        'click',
        'pynwb',
        'pyyaml',
        'h5py'
    ]
)
