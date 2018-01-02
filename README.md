# cealloga
[![Build Status](https://travis-ci.org/ancamcheachta/cealloga.svg?branch=master)](https://travis-ci.org/ancamcheachta/cealloga)

Simple microservices on demand

## API
### Examples
#### Code resource
##### Successful `GET` request to `/code/12345` yielding a published resource
###### Response status
`200 OK`

###### Response body
```json
{
    "compiled": true,
    "id": "12345",
    "label": "Empty Array",
    "name": "empty_array",
    "published": true,
    "service": "/cealloga/empty_array"
}
```

##### Successful `GET` request to `/code/67890` yielding an unpublished resource
###### Response status
`200 OK`

###### Response body
```json
{
    "compiled": true,
    "id": "67890",
    "label": "Empty Array",
    "name": "empty_array",
    "published": false,
    "service": "/cealloga/_test/67890"
}
```

##### Failed `GET` request to `/code/abcde` due to non-existing resource
###### Response status
`404 NOT_FOUND`

###### Response body
```json
{   
    "error_type": "NON_EXISTING_RESOURCE",
    "message": "Resource id 'abcde' does not exist."
}
``` 

#### Code list
##### Successful `GET` request to `/code` listing published (default) services
###### Response status
`200 OK`

###### Response body
```json
[{
    "compiled": true,
    "id": "abcde",
    "label": "Empty Array",
    "name": "empty_array",
    "published": true,
    "service": "/cealloga/empty_array"
}, {
    "compiled": true,
    "id": "vwxyz",
    "label": "Hello World",
    "name": "hello_world",
    "published": true,
    "service": "/cealloga/hello_world"
}]
```

##### Successful `GET` request to `/code?published=0&name=empty_array` listing unpublished services
###### Response status
`200 OK`

###### Response body
```json
[{
    "compiled": true,
    "id": "12345",
    "label": "Empty Array",
    "name": "empty_array",
    "published": false,
    "service": "/cealloga/_test/12345"
}]
```

##### Failed `GET` request to `/code?published=0` because `name` parameter missing
###### Response status
`400 BAD_REQUEST`

###### Response body
```json
{   
    "error_type": "MISSING_NAME_PARAMETER",
    "message": "`name` parameter must be included when querying unpublished resources."
}
```

#### Validation
##### Successful `POST` request to `/code/validate`
###### Request body
```json
{
    "name": "empty_array",
    "label": "Empty Array",
    "body": "(cealloga) => { return []; }"
}
```

###### Response status
`201 CREATED`

###### Response body
```json
{
    "compiled": true,
    "id": "12345",
    "published": false,
    "service": "/cealloga/_test/12345"
}
```

##### Failed `POST` request to `/code/validate` due to invalid code
###### Request body
```json
{
    "name": "empty_array",
    "label": "Empty Array",
    "body": "(cealloga) => { return [; }"
}
```

###### Response status
`400 BAD_REQUEST`

###### Response body
```json
{
    "error_type": "COMPILATION_FAILED",
    "compiled": false,
    "location": {
        "start": {
            "line": 1,
            "column": 24
        },
        "end": {
            "line": -1,
            "column": -1
        }
    },
    "message": "Line 1: Unexpected token ;"
}
```

#### Publishing resources
##### Successful `GET` request to `/code/publish/12345`
###### Response status
`200 OK`

###### Response body
```json
{
    "compiled": true,
    "id": "abcde",
    "label": "Empty Array",
    "name": "empty_array",
    "published": true,
    "service": "/cealloga/empty_array"
}
```

##### Failed `GET` request to `/code/publish/12345` due to invalid temporary resource code
###### Response status
`400 BAD_REQUEST`

###### Response body
```json
{
    "error_type": "INVALID_RESOURCE",
    "message": "Could not publish invalid code. Please review errors and try again.",
    "compiler_error": {
        "compiled": false,
        "location": {
            "start": {
                "line": 1,
                "column": 24
            },
            "end": {
                "line": -1,
                "column": -1
            }
        },
        "message": "Line 1: Unexpected token ;"
    }
}
```

##### Failed `GET` request to `/code/publish/12345` because resource is already published
###### Response status
`400 BAD_REQUEST`

###### Response body
```json
{   
    "error_type": "RESOURCE_ALREADY_PUBLISHED",
    "compiled": true,
    "message": "Resource id '12345' already published for `/cealloga/empty_array`."
}
```

#### Unpublish resources
##### Successful `GET` request to `/code/unpublish/empty_array`
###### Response status
`200 OK`

###### Response body
```json
{
    "compiled": true,
    "id": "abcde",
    "label": "Empty Array",
    "name": "empty_array",
    "published": false,
    "service": "/cealloga/_test/abcde"
}
```

##### Failed `GET` request to `/code/unpublish/empty_array` because resource is already unpublished
###### Response status
`400 BAD_REQUEST`

###### Response body
```json
{   
    "error_type": "RESOURCE_ALREADY_UNPUBLISHED",
    "message": "Resource `/cealloga/empty_array` already unpublished."
}
```

## TODO
* [x] Document `/code` (GET)
* [x] Document `/code/:id` (GET)
* [x] Document `/code/validate` (POST)
* [x] Document `/code/publish/:id` (GET)
* [x] Document `/code/unpublish/:name` (GET)
* [x] Support successful `POST` request to `/code/validate`
* [x] Support failed `POST` request to `/code/validate`
* [x] Write tests for `/code/validate`
* [x] Support successful `GET` request to `/code/publish`
* [x] Support failing `GET` request to `/code/publish`
* [x] Standardise error handling in publish.js and validate.js
* [x] Support successful `GET` request to `/code/unpublish`
* [x] Support successful `GET` request to `/code/:id`
* [ ] Support successful `GET` request to `/code`
* [ ] Add URI name validation regex to `/code/validate`
* [ ] Add URI blacklist check to `/code/validate`
* [ ] Document `/cealloga/_test/:id` (POST)
* [ ] Document `/cealloga/:name` (POST)
