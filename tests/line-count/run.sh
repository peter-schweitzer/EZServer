#!/bin/bash
cd src
numLines = $(wc -l $(ls) | grep total | sed -nr "s/([0-9]+).*$/\1/p")
echo $numLines
if [[ $(($numLines)) -gt 1000 ]];
then exit 1
else exit 0
fi
