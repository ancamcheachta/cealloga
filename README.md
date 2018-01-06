# cealloga
[![Build Status](https://travis-ci.org/ancamcheachta/cealloga.svg?branch=master)](https://travis-ci.org/ancamcheachta/cealloga)
[![Coverage Status](https://coveralls.io/repos/ancamcheachta/cealloga/badge.svg)](https://coveralls.io/r/ancamcheachta/cealloga)

Simple microservices on demand

## Requirements
* [Node 6.11+](https://nodejs.org/en/download/)
* [MongoDB 3.4+](https://docs.mongodb.com/manual/installation/)

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
* [x] Support successful `GET` request to `/code`
* [x] Add formatter for `/code` list response
* [ ] Add URI name validation regex to `/code/validate`
* [ ] Add URI blacklist check to `/code/validate`
* [ ] Document `/cealloga/_test/:id` (POST)
* [ ] Document `/cealloga/:name` (POST)
