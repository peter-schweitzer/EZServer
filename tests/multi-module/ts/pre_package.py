#!/bin/python3
import json

with open("package.json", "r+") as f:
    j = json.decoder.JSONDecoder().decode(f.read())
    if j.get("dependencies") is not None:
        del j["dependencies"]
    if j.get("devDependencies") is not None:
        del j["devDependencies"]
    f.seek(0)
    f.write(json.encoder.JSONEncoder().encode(j))
    f.truncate()
