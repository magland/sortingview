#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-11dev

yarn build
gsutil -m cp -R ./dist/* $TARGET/
