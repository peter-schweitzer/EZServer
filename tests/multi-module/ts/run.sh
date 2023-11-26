#!/bin/bash

cd ./tests/multi-module/ts && npx tsc --target esnext -m nodenext index.ts && node . && rm index.js || exit 1
exit 0
