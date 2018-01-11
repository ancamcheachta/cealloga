/**
 * @desc Exposes utilities for working with the uri blacklist as defined in
 * the settings json file.
 * @since 0.1.0
 */

'use strict';

/**
 * @ignore
 */
const uriBlacklistArray = require('./settings').uri_blacklist;

/**
 * @ignore
 */
let uriBlacklistObject = {};

uriBlacklistArray.forEach(uri => {
	uriBlacklistObject[uri] = 0;
});

module.exports = {
	/**
	 * @param {string} uri The uri to check in the blacklist.
	 * @return {boolean} Whether the uri is included in the blacklist.
	 * @since 0.1.0
	 */
	has: uri => {
		return uri in uriBlacklistObject;
	}
};
