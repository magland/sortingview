#!/bin/bash

set -ex

cd gui
rm -rf dist
yarn install
yarn build
npm publish --access public --dry-run

echo "Proceed with publishing to npm? (y/n)"
read answer
if [ "$answer" != "${answer#[Yy]}" ] ;then
    npm publish --access public
else
    echo "Aborted."
fi