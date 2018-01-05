'use strict';

const CeallogFunction = require('../models/CeallogFunction');
const HttpError = require('../classes/HttpError');
const ListError = require('../classes/ListError');

const messages = {
	MISSING_NAME_PARAMETER:
		'`name` parameter must be included when querying unpublished resources.'
};

const formatter = response => {
	response.id = response._id;
	delete response.__v;
	delete response._id;
};

const query = (req, res, next) => {
	let name = req.query.name;
	let published = req.query.published;
	let callback = (err, response) => {
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
