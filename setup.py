from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
        'bin/sortingview-start-backend'
    ],
    include_package_data = True,
    install_requires=[
        'click',
        'kachery-client>=1.0.18',
        'figurl>=0.1.3',
        'hither>=0.8.1',
        'pynwb',
        'pyyaml',
        'spikeextractors>=0.9.6',
        'spikecomparison',
        'seriesview>=0.1.0'
    ]
)
