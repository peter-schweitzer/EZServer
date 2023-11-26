#!/bin/python3

import json

j: dict

with open("package.json", "r") as f:
  j = json.decoder.JSONDecoder().decode(f.read())


if "dependencies" in j.keys(): del j["dependencies"]
if "devDependencies" in j.keys(): del j["devDependencies"]

with open("package.json", "w") as f:
  f.write(json.encoder.JSONEncoder().encode(j))
