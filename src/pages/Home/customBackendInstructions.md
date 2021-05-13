# Using your own backend provider

The frontend (GUI) and backend (compute engine) of this web app are decoupled, allowing you to view your own data without uploading to our servers. You can also share those views with remote collaborators without uploading any data.

## Create a Google Storage Bucket

You will need to [create a Google Cloud Storage Bucket](https://cloud.google.com/storage/docs/creating-buckets) to store the cached data required for rendering the front-end visualization. Note that this bucket will not need to store the large raw files.

After creating the bucket, download the credentials to a .json file on the computer where you will be running the backend compute resource.

## Install the Python package

It is recommended that you use a conda environment with `Python >=3.8`.

```bash
# After activating the conda environment
pip install --upgrade "git+https://github.com/magland/sortingview#egg=sortingview&subdirectory=src/python"
```

## Run the backend provider

To run the backend provider, create a startup script called `sortingview-backend.sh`, filling in the details for `name-of-google-bucket`, `path-to-google-application-credentials-json-file`, and `choose-a-label`

```bash
#!/bin/bash

export GOOGLE_BUCKET_NAME="name-of-google-bucket"
export GOOGLE_APPLICATION_CREDENTIALS="path-to-google-application-credentials-json-file"

sortingview-start-backend --label choose-a-label --app-url https://sortingview.vercel.app
```

Run this script and keep it running in a terminal (you may want to use a tool like tmux). Make a note of the `Backend URI` as output from this program.

## Select your custom backend provider in the app

On the main page of the app, click to specify a different backend provider, and paste in the URI obtained in the previous step.