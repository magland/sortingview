from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
        'bin/sortingview-start-backend'
    ],
    include_package_data = True,
    install_requires=[
        'click',
        'kachery-client>=1.2.0',
        'figurl2>=0.1.6',
        'pynwb',
        'pyyaml',
        'spikeextractors>=0.9.9',
        'spikecomparison',
        'spikeinterface>=0.94.0'
    ]
)
