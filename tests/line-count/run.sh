#!/bin/bash

cd src

lineCounts=$(wc -l *)
cnt=$(echo "$lineCounts" | grep total | sed -E "s| +([0-9]+) total|\1|")

if [[ $cnt -gt 1000 ]]
then code=1; color=1
else code=0; color=2
fi

echo "$lineCounts" | sed -E "s|( +)([0-9]+) total$|\1\x1b[9${color};49;1m\2/1000\x1b[0m|g"
exit $code
