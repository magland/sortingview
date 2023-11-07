#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-9-annotation-dev

yarn build
gsutil -m cp -R ./build/* $TARGET/
