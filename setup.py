from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
        'bin/sortingview-start-backend'
    ],
    include_package_data = True,
    install_requires=[
        'click',
        'figurl>=0.1.2',
        'pynwb',
        'pyyaml',
        'spikeextractors>=0.9.6'
    ]
)
