#!/usr/bin/env bash

# Reference: https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html
echo '{ "type": "commonjs" }' > dist/cjs/package.json
echo '{ "type": "module" }' > dist/esm/package.json
