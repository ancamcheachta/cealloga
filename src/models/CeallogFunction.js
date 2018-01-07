'use strict';

const mongoose = require('mongoose');
const settings = require('../settings');

mongoose.Promise = global.Promise;

const uri = settings.mongo.uri;
const db = mongoose.createConnection(uri);
const Schema = mongoose.Schema;

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
