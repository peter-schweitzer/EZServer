#!/bin/bash

cd src
lineCounts=$(wc -l $(ls))

if [[ $(echo "$lineCounts" | grep total | sed -E "s|^\W*([0-9]+) total$|\1|") -gt 1000 ]];
then code=1; color="31"
else code=0; color="32"
fi

echo "$lineCounts" | sed -E "s|(^\W*)([0-9]+)( total$)|\x1b[$color;1m\1\2/1000\x1b[0m|g"
exit $code
