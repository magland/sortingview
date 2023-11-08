#!/bin/bash

set -ex

TARGET=gs://figurl/sortingview-11dev

yarn build
gsutil -m cp -R ./dist/* $TARGET/
