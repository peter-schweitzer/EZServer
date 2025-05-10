#!/bin/bash

./tests/multi-module/jsm/run.sh || exit 1
./tests/multi-module/cjs/run.sh || exit 2
exit 0
