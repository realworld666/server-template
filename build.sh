#!/bin/bash
pushd server
yarn install
npm run swagger
pushd public
yarn install
npm run build
popd
npm run build
popd
