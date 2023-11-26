#!/bin/bash

cd ./tests/multi-module/ts && rm -rf node_modules  && ./pre_package.py && npm i --save-dev typescript @types/node  && ./post_package.py && mkdir node_modules/@peter-schweitzer && ln -s ../../../../../ ./node_modules/@peter-schweitzer/ezserver && npx tsc && node . || exit 1

rm index.js
exit 0
