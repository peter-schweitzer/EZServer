#!/bin/python3
import json

with open("package.json", "r+") as f:
    j = json.decoder.JSONDecoder().decode(f.read())
    j["dependencies"] = {"@peter-schweitzer/ezserver": "develop"}
    f.seek(0)
    f.write(json.encoder.JSONEncoder().encode(j))
    f.truncate()
