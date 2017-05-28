#!/bin/sh

# Build the zip file
mkdir -p build
rm -r build/*
cp -r package.json yarn.lock index.js lib build
(
    cd build;
    yarn --production;
    rm package.json;
)
zip -qrmX build.zip build
