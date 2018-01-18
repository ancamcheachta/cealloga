/**
 * @desc Exports `CeallogFunction` mongoose schema.
 * @since 0.1.0
 */
'use strict';

/**
 * @ignore
 */
const mongoose = require('mongoose'),
	settings = require('../settings');

mongoose.Promise = global.Promise;

/**
 * @ignore
 */
const uri = settings.mongo.uri,
	db = mongoose.createConnection(uri),
	Schema = mongoose.Schema;

/**
 * @ignore
 */
const CeallogFunctionSchema = new Schema({
	body: {
		required: '`body` must be populated.',
		type: String
	},
	compiled: {
		type: Boolean
	},
	created_date: {
		default: Date.now,
		type: Date
	},
	name: {
		required: '`name` must be populated.',
		type: String
	},
	label: {
		required: '`label` must be populated.',
		type: String
	},
	published: {
		default: false,
		type: Boolean
	}
});

module.exports = db.model('CeallogFunction', CeallogFunctionSchema);
