# Development

```
index.js - entrypoint of the ezserver-packeage
 |-http_methods as HTTP_METHODS - 'Enum' (Object&lt;string, string>) for ez http-method usage & verification
 | |-GET: 'GET'
 | |-HEAD: 'HEAD'
 | |-POST: 'POST'
 | |-PUT: 'PUT'
 | |-DELETE: 'DELETE'
 | |-CONNECT: 'CONNECT'
 | |-OPTIONS: 'OPTIONS'
 | |-TRACE: 'TRACE'
 | '-PATCH: 'PATCH'
 |
 |-App - the main EZServer-Class
 | |-constructor(): App
 | |-
 | |-
 | |-
 | |-
 | |-
 | '-
 |
 |
 |-Parameters
 |
 | !these are all reexportet from the src/utils.js
 |-buildRes(res: http.ServerResponse, data: any)
 |-getType
 |-serveFromFS
 |-getBodyJSON
 |-throw404
 '-
```
