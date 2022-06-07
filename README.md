# EZServer

simple, ultra light weight node.js template with 0 dependencies to bootstrap simple file hosting and RESTfull API development

## Resolving reqests

you can register resolvers, endpoints and REST-endpoints

Reolvers have the highest specificity and highest priority.
Endpoints can be part of a group, where the group provides the resolver function.
REST-endpoints are like endpoints without groups and specific resolver functions based on request method.

