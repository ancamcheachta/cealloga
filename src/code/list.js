/**
 * @desc Exports a router for `/code/`, the service to obtain a list of code
 * resources
 * @since 0.1.0
 */
'use strict';

/**
 * @ignore
 */
const CeallogFunction = require('../models/CeallogFunction'),
	HttpError = require('../classes/HttpError'),
	ListError = require('../classes/ListError');

/**
 * @desc An object acting like a map where key represents the type of message
 * and the value is a string with the message itself.
 * @since 0.1.0
 */
const messages = {
	MISSING_NAME_PARAMETER:
		'`name` parameter must be included when querying unpublished resources.'
};

/**
 * @desc Used to format mongoose responses prior to sending json response.
 * @param {Object} response mongoose resonse to be formatted.
 * @since 0.1.0
 */
const formatter = response => {
	response.id = response._id;
	delete response.__v;
	delete response._id;
};

/**
 * @desc Queries code based on query string parameters provided.  If none
 * are provided, the latest results for each ceallog function name is sent.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {function} next Function to be called by Express next.
 * @since 0.1.0
 */
const query = (req, res, next) => {
	let name = req.query.name;
	let published = req.query.published;
	let callback = (err, response) => {
		/* istanbul ignore if */
		if(err) {
			try {
				throw new ListError(err.name, 'INTERNAL_SERVER_ERROR');
			} catch(e) {
				new HttpError(e).send(res);
			} finally {
				return;
			}
		}
		
		if(response instanceof Array) {
			response.forEach(formatter);
		}
		
		res.json(response);
	};

	if (published != null || name != null) {
		let query;

		if (published == '0') {
			if (!name) {
				try {
					throw new ListError(
						messages.MISSING_NAME_PARAMETER,
						'MISSING_NAME_PARAMETER'
					);
				} catch (e) {
					new HttpError(e, e.errorType, 400).sendError(res);
				} finally {
					return;
				}
			}

			query = {$and: [{published: false}, {name: name}]};
		} else if (name != null) {
			query = {name: name};
		} else {
			query = {published: true};
		}

		return CeallogFunction.find(query, callback);
	} else {
		// Query latest
		let query = [
			{ $sort: { created_date: -1 } },
			{ $group: {
			    _id: "$name",
			    ceallogaFunctions: { $push: "$$ROOT" }
			}},
			{ $replaceRoot: {
			    newRoot: { $arrayElemAt: ["$ceallogaFunctions", 0] }
			}}
		];
		
		CeallogFunction.aggregate(query, callback);
	}
};

module.exports = [query];
