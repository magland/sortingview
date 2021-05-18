# Using your own backend provider

The frontend (GUI) and backend (compute engine) of this web app are decoupled, allowing you to view your own data without uploading to our servers. You can also share those views with remote collaborators. Below are instructions for configuring and running your own backend provider for sortingview.

## Run a kachery daemon

See [these instructions](https://github.com/flatironinstitute/kachery-p2p/blob/main/doc/setup_and_installation.md) to set up and run a kachery daemon on the machine where your backend provider will be running.

## Install the sortingview Python package

It is recommended that you use a conda environment with `Python >=3.8`. If you prefer you can reuse the same conda environment used for the kachery daemon above.

```bash
# After activating the conda environment
pip install --upgrade "git+https://github.com/magland/sortingview#egg=sortingview&subdirectory=src/python"
```

## Set up the Google Storage Bucket

A Google Storage Bucket is used to store the cached data required for rendering the front-end visualization. Note that this bucket will not need to store the large raw files.

Obtain the Google application credentials for accessing the Google Storage bucket. If you are creating the bucket yourself, follow the instructions below. Otherwise, the person setting up the bucket should provide the secret credentials to you in a .json file. Put that .json file somewhere on the computer where your backend provider will be running. Set the permissions so no other users can read the file.

## Run the backend provider

To run the backend provider, create a startup script called `sortingview-backend.sh`, filling in the details for `name-of-google-bucket`, `path-to-google-application-credentials-json-file`, and `choose-a-label`

```bash
#!/bin/bash

export GOOGLE_BUCKET_NAME="name-of-google-bucket"
export GOOGLE_APPLICATION_CREDENTIALS="path-to-google-application-credentials-json-file"
export LABEL="choose-a-label"

sortingview-start-backend --label $LABEL --app-url https://sortingview.vercel.app
```

Run this script in the conda environment and keep it running in a terminal (you may want to use a tool like tmux). Make a note of the `Backend URI` as output from this program.

## Select your custom backend provider in the app

On the main page of the app, click to specify a different backend provider, and paste in the URI obtained in the previous step.

## Google Storage Bucket configuration

These are the instructions for creating and configuring a Google Storage Bucket to store the cached data required for rendering the front-end visualization. Note that this bucket will not need to store the large raw files. If somebody else created the bucket for you, you'll just need to get the secret credentials .json file from them.

1. [Create a Google Cloud Storage Bucket](https://cloud.google.com/storage/docs/creating-buckets)
2. Configure the bucket so that [all objects in the bucket are publicly readable](https://cloud.google.com/storage/docs/access-control/making-data-public#buckets).
3. Configure Cross-Origin Resource Sharing (CORS) on your bucket by creating a file named `cors.json` with the following content:

```json
[
    {
      "origin": ["http://localhost:3000"],
      "method": ["GET"],
      "responseHeader": ["Content-Type"],
      "maxAgeSeconds": 3600
    },
    {
      "origin": ["https://sortingview.vercel.app"],
      "method": ["GET"],
      "responseHeader": ["Content-Type"],
      "maxAgeSeconds": 3600
    }
]
```

and then using the [gsutil utility to set this CORS on your bucket](https://cloud.google.com/storage/docs/configuring-cors#configure-cors-bucket).

4. [Create a Google Cloud service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts#creating) and give it access to your bucket.

5. [Create and download credentials for your service account](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys) to a .json file on the computer where you will be running the backend compute resource

6. Give the service account permission to access your bucket with the "Storage Object Admin" role.

After creating the bucket, download the credentials to a .json file on the computer where you will be running the backend compute resource. Set the permissions so no other users can read the file.