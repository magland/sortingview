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
        'kachery-client>=1.0.12',
        'pynwb',
        'pyyaml',
        'spikeextractors>=0.9.6',
        'google-auth',
        'cachecontrol'
    ]
)
