#!/bin/bash

cd src

lineCounts=$(wc -l *)
cnt=$(echo "$lineCounts" | grep total | sed -E "s| +([0-9]+) total|\1|")

if [[ $cnt -gt 1000 ]]
then code=1; color=1
else code=0; color=2
fi

echo "$lineCounts" | sed -E "s|( +)([0-9]+) total$|\1\x1b[9${color};49;1m\2/1000\x1b[0m|g"

if [ $# -gt 0 ] && [ $1 = "--batteries" ]; then
  cd ../batteries

  batteryLineCounts=$(wc -l */*)
  total_cnt=$(($cnt + $(echo "$batteryLineCounts" | grep total | sed -E "s| *([0-9]+) total$|\1|")))

  if [[ $total_cnt -gt 1000 ]]
  then color=3
  else color=2
  fi

  echo -e "\n$batteryLineCounts" | sed -E "s|( +)([0-9]+)( total$)|\1\x1b[9${color};1m\2\x1b[0m\3|g"

  if [[ $cnt -gt 1000 ]]; then color=1; fi
  echo -e "\ntotal: \x1b[9$color;1m$total_cnt/1000\x1b[0m"
fi

exit $code
