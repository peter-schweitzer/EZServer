#!/bin/bash

node ./test/multi-module/cjs/index.js || exit 1;
node ./test/multi-module/jsm/index.js || exit 1
exit 0
