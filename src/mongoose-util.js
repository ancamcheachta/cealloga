'use strict';

const mongoose = require('mongoose');

const responses = {
	INVALID_ID: {
		statusCode: 400,
		message: 'Invalid id.'
	},
	INTERNAL_SERVER_ERROR: {
		statusCode: 500,
		message: 'An internal error occurred.'
	},
	MISSING_PARAMS: {
		statusCode: 400,
		message: 'Missing required query parameters.'
	},
	MISSING_RESOURCE: {
		statusCode: 404,
		message: 'Missing resource.'
	},
	REMOVED_RESOURCE: {
		statusCode: 204,
		message: null
	},
	RESOURCE_NOT_FOUND: {
		statusCode: 404,
		message: 'Resource not found.'
	},
	SAVE_RESULT: {
		statusCode: 201,
		message: 'Resource created.'
	},
	SUCCESS: {
		statusCode: 200,
		message: 'Resource retrieved successfully.'
	},
	UPDATE_RESULT: {
		statusCode: 204,
		message: null
	},
	UPDATE_ERROR: {
		statusCode: 406,
		message: 'Server rejected partial resource.'
	},
	VALIDATION_ERROR: {
		statusCode: 400,
		message: 'There were problems with the values you provided. Please review.'
	}
};

const util = {
	getObjectId: str => {
		let oid = null;
		try {
			oid = mongoose.Types.ObjectId(str);
		} catch (e) {} // TODO: define exception behaviour
		return oid;
	},
	dbResultCallback: req => {
		return function(err, results) {
			req.mongooseResults = req.mongooseResults || [];

			let mongooseResult = {};

			mongooseResult.isErr =
				err != null &&
				typeof err == 'object' &&
				'name' in err &&
				'errors' in err;
			// mongooseResult.isSave = !mongooseResult.isErr && !err && results && typeof results == 'object' && '_id' in results;
			mongooseResult.isUpdate =
				!mongooseResult.isErr &&
				!err &&
				results &&
				typeof results == 'object' &&
				'ok' in results;
			mongooseResult.isDelete =
				!mongooseResult.isErr &&
				!err &&
				results &&
				typeof results == 'object' &&
				'result' in results &&
				'ok' in results.result;
			mongooseResult.results = results;
			mongooseResult.err = err;

			switch (true) {
				case err != null && err.name == 'ValidationError':
					mongooseResult.type = 'VALIDATION_ERROR';
					break;
				case mongooseResult.isSave:
					mongooseResult.type = 'SAVE_RESULT';
					break;
				case mongooseResult.isUpdate && results.ok > 0:
					mongooseResult.type = 'UPDATE_RESULT';
					break;
				case mongooseResult.isUpdate && results.ok == 0:
					mongooseResult.type = 'UPDATE_ERROR';
					break;
				case mongooseResult.isDelete:
					mongooseResult.type = 'REMOVED_RESOURCE';
					break;
				case err != null:
					mongooseResult.type = 'INTERNAL_SERVER_ERROR';
					break;
				default:
					mongooseResult.type = 'SUCCESS';
			}

			mongooseResult.message = responses[mongooseResult.type].message;
			mongooseResult.statusCode = responses[mongooseResult.type].statusCode;

			req.mongooseResults.push(mongooseResult);

			return mongooseResult;
		};
	}
};

module.exports = util;
