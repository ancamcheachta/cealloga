/**
 * @desc Exports a router for `/code/:id`, the service to obtain a single code
 * resource
 * @since 0.1.0
 */
'use strict';

/**
 * @ignore
 */
const CeallogFunction = require('../models/CeallogFunction'),
	HttpError = require('../classes/HttpError'),
	RecordError = require('../classes/RecordError'),
	settings = require('../settings');

/**
 * @desc An object acting like a map where key represents the type of message
 * and the value is a string with the message itself.
 * @since 0.1.0
 */
const messages = {
	MISSING_PARAMS: 'Required parameters missing.',
	NON_EXISTING_RESOURCE: 'Resource does not exist.'
};

/**
 * @desc Attempts to find one ceallog function resource in mongodb with an
 * id contained in `req.params.id`.  Sends the result via `res`.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {function} next Function to be called by Express next.
 * @since 0.1.0
 */
module.exports = (req, res, next) => {
	let id = req.params.id;

	/* istanbul ignore else */
	if (id) {
		CeallogFunction.findOne({_id: id}, (err, result) => {
			if (err) {
				try {
					throw new RecordError(
						messages.NON_EXISTING_RESOURCE,
						'NON_EXISTING_RESOURCE'
					);
				} catch (e) {
					new HttpError(e, e.errorType, 404).sendError(res);
				}
			} else {
				let service = result.published
					? `/${settings.cealloga.api_path}/${result.name}`
					: `/${settings.cealloga.api_path}/${settings.cealloga.test_path}/${
							result._id
						}`;

				res.statusCode = 200;
				res.json({
					id: result._id,
					body: result.body,
					compiled: result.compiled,
					label: result.label,
					name: result.name,
					published: result.published,
					service: service
				});
			}
		});
	} else {
		try {
			throw new RecordError(messages.MISSING_PARAMS, 'MISSING_PARAMS');
		} catch (e) {
			new HttpError(e, e.errorType, 400).sendError(res);
		}
	}
};
