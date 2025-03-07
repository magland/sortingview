from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
    ],
    include_package_data = True,
    install_requires=[
        'spikeinterface>=0.97.0',
        'kachery>=2.0.2,<3',
        'figurl==0.3.0a1',
        'matplotlib',
        'click',
        'pynwb',
        'pyyaml',
        'h5py'
    ]
)
