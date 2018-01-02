'use strict';

const uriBlacklistArray = require('./settings').uri_blacklist;

let uriBlacklistObject = {};

uriBlacklistArray.forEach((uri) => {
    uriBlacklistObject[uri] = 0;
});

module.exports = {
    has: (uri) => {
        return uri in uriBlacklistObject;
    }
};
