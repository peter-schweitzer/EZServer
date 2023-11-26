#!/bin/python3

import json

j: dict

with open("package.json", "r") as f:
  j = json.decoder.JSONDecoder().decode(f.read())

j["dependencies"] = {"@peter-schweitzer/ezserver": "develop"}

with open("package.json", "w") as f:
  f.write(json.encoder.JSONEncoder().encode(j))
