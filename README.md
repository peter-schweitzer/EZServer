# EZServer

<span style="color: #ff2020">EZServer is still in development, and won't be `'stable'` / `'production-ready'` until release 2.x.y<span>

simple, ultra light weight node.js module with 0 dependencies for simple backend/REST-API development

> EZServer is developed on current node version (v18)
> but will most likely run on all active LTS versions

## Resolving reqests

you can register resolvers, endpoints and REST-endpoints

Reolvers have the highest specificity and highest priority.
Endpoints can be part of a group, where the group provides the resolver function.
REST-endpoints are like endpoints without groups and specific resolver functions based on request method.

> for more info & examples look at [`example/index.js`](https://github.com/peter-schweitzer/EZServer/blob/master/example/index.js)

