#!/bin/bash

set -ex

TARGET=gs://figurl/sortingview-11

yarn upgrade
yarn build
gsutil -m cp -R ./dist/* $TARGET/