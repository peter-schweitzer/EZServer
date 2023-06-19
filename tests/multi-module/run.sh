#!/bin/bash

node ./tests/multi-module/cjs/index.js || exit 1;
node ./tests/multi-module/jsm/index.js || exit 1
exit 0
