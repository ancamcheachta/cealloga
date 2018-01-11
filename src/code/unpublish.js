/**
 * @desc Exports a router for `/code/unpublish/:name`, the service to unpublish
 * the code of a specified name.
 * @since 0.1.0
 */
'use strict';

/**
 * @ignore
 */
const CeallogFunction = require('../models/CeallogFunction'),
	dbResultCallback = require('../mongoose-util').dbResultCallback,
	HttpError = require('../classes/HttpError'),
	settings = require('../settings'),
	UnpublishError = require('../classes/UnpublishError');

/**
 * @desc An object acting like a map where key represents the type of message
 * and the value is a string with the message itself.
 * @since 0.1.0
 */
const messages = {
	MISSING_PARAMS: 'Required parameters missing.',
	NON_EXISTING_RESOURCE: 'Resource does not exist.',
	UNKNOWN_UPDATE_ERROR: 'Unknown update error.'
};

/**
 * @desc Attempts to find the existing published resource by the name provided.
 * If successful, the result is added to `req.unpublisher.result`.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {function} next Function to be called by Express next.
 * @since 0.1.0
 */
const findPublished = (req, res, next) => {
	let err;

	/* istanbul ignore else */
	if ('name' in req.params) {
		let name = req.params.name;
		let query = {
			$and: [{name: name}, {published: true}]
		};
		
		req.unpublisher = req.unpublisher || {record: null};

		CeallogFunction.findOne(query, (err, result) => {
			let dbResult = dbResultCallback(req.unpublisher)(err, result);

			if (dbResult.type == 'SUCCESS' && result) {
				req.unpublisher.record = result;

				next();
			} else {
				try {
					throw new UnpublishError(
						messages.NON_EXISTING_RESOURCE,
						'NON_EXISTING_RESOURCE'
					);
				} catch (e) {
					err = new HttpError(e, e.errorType, 404);
					err.sendError(res);
				}
			}
		});
	} else {
		try {
			throw new UnpublishError(messages.MISSING_PARAMS, 'MISSING_PARAMS');
		} catch (e) {
			err = new HttpError(e, e.errorType, 400);
			err.sendError(res);
		}
	}
};

/**
 * @desc Attempts to change published to false and update
 * `req.unpublisher.record`.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {function} next Function to be called by Express next.
 * @since 0.1.0
 */
const update = (req, res, next) => {
	let record = req.unpublisher.record;

	/* istanbul ignore else */
	if (record) {
		CeallogFunction.update(
			{_id: record._id},
			{published: false},
			(err, result) => {
				let dbResult = dbResultCallback(req.unpublisher)(err, result);
				let innerErr;

				switch (dbResult.type) {
					case 'UPDATE_RESULT':
						break;
					/* istanbul ignore next */
					case 'UPDATE_ERROR':
						innerErr = new UnpublishError(dbResult.message, 'UPDATE_ERROR');
						break;
					/* istanbul ignore next */
					case 'VALIDATION_ERROR':
						innerErr = new UnpublishError(dbResult.message, 'VALIDATION_ERROR');
						break;
					/* istanbul ignore next */
					default:
						innerErr = new UnpublishError(
							dbResult.message,
							'INTERNAL_SERVER_ERROR'
						);
						break;
				}
				
				/* istanbul ignore if */
				if (innerErr != null) {
					try {
						throw innerErr;
					} catch (e) {
						new HttpError(e, e.errorType, dbResult.statusCode).sendError(res);
					}
				} else {
					res.statusCode = 200;
					res.json({
						compiled: record.compiled,
						id: record.id,
						label: record.label,
						name: record.name,
						published: false,
						service: `/${settings.cealloga.api_path}/${
							settings.cealloga.test_path
						}/${record._id}`
					});
				}
			}
		);
	} else {
		try {
			throw new UnpublishError(
				'UNKNOWN_UPDATE_ERROR',
				messages.UNKNOWN_UPDATE_ERROR
			);
		} catch (e) {
			new HttpError(e).sendError(res);
		}
	}
};

module.exports = [findPublished, update];
