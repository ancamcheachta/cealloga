'use strict';

const CeallogFunction = require('../models/CeallogFunction');
const dbResultCallback = require('../mongoose-util').dbResultCallback;
const HttpError = require('../classes/HttpError');
const settings = require('../settings');
const UnpublishError = require('../classes/UnpublishError');

const messages = {
	MISSING_PARAMS: 'Required parameters missing.',
	NON_EXISTING_RESOURCE: 'Resource does not exist.',
	UNKNOWN_UPDATE_ERROR: 'Unknown update error.'
};

const findPublished = (req, res, next) => {
	let err;

	/* istanbul ignore else */
	if ('name' in req.params) {
		let name = req.params.name;

		req.unpublisher = req.unpublisher || {record: null};

		CeallogFunction.findOne({name: name}, (err, result) => {
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
