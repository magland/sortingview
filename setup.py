from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
        'bin/sortingview-start-backend'
    ],
    include_package_data = True,
    install_requires=[
        'click',
        'kachery-client>=1.0.16',
        'figurl>=0.1.2',
        'pynwb',
        'pyyaml',
        'spikeextractors>=0.9.6'
    ]
)
