#!/bin/bash
cd src
echo "" > /dev/tty
numLines=$(wc -l $(ls) | tee /dev/tty | grep total | sed -E "s|(^\W*)([0-9]+)(.*$)|\2|")
if [[ $(($numLines)) -gt 1000 ]];
then exit 1
else exit 0
fi
