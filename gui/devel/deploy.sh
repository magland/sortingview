#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-11

yarn upgrade
yarn build
gsutil -m cp -R ./build/* $TARGET/