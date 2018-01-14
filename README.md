# cealloga
[![Build Status](https://travis-ci.org/ancamcheachta/cealloga.svg?branch=master)](https://travis-ci.org/ancamcheachta/cealloga)
[![Coverage Status](https://coveralls.io/repos/ancamcheachta/cealloga/badge.svg)](https://coveralls.io/r/ancamcheachta/cealloga)

Simple microservices on demand

## Requirements
* [Node 6.11+](https://nodejs.org/en/download/)
* [MongoDB 3.4+](https://docs.mongodb.com/manual/installation/)

## TODO
* [x] Handle responses in /src/cealloga/dev.js
* [ ] Abstract common code for /src/cealloga/dev.js and /src/cealloga/prod.js
* [ ] Load plugin from list in settings.json rather than from server itself
* [x] Write tests for `/ceallog/*` services and plugins
* [ ] Add `initModule` code to cache
* [ ] Write tests for /src/cache.js