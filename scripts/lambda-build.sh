#!/bin/sh

# Build the zip file
mkdir -p build
rm -r build/*
cp -r package.json index.js lib build
(
    cd build;
    npm install --production;
    rm package.json;
)
zip -qrmX build.zip build
