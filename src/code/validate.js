/**
 * @desc Exports a router for `/code/validate/` used to validate, compile, and
 * create code records in database.
 * @since 0.1.0
 */
'use strict';

// Requirements
/**
 * @ignore
 */
const CeallogFunction = require('../models/CeallogFunction'),
	compileRequest = require('../compiler').compileRequest,
	dbResultCallback = require('../mongoose-util').dbResultCallback,
	HttpError = require('../classes/HttpError'),
	settings = require('../settings'),
	uriBlacklist = require('../uri-blacklist'),
	ValidateError = require('../classes/ValidateError');

// Constants
/**
 * @desc An object acting like a map where key represents the type of message
 * and the value is a string with the message itself.
 * @since 0.1.0
 */
const messages = {
	NAME_NOT_ALLOWED: '`name` value cannot be used. Please choose another.',
	NO_BODY: 'Required `body` field missing.',
	NO_LABEL: 'Required `label` field missing.',
	NO_NAME: 'Required `name` field missing.',
	INVALID_NAME: '`name` invalid: must be an allowed URL segment.',
	UNEXPECTED_DB_RESULT: 'Unexpected database result.'
};

// Functions
/**
 * @desc Checks `req.body` to make sure it contains `body`, `name`, and `label`
 * fields. If not, an error is sent via `res`. If so, the next function is
 * called.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {function} next Function to be called by Express next.
 * @since 0.1.0
 */
const handleBody = (req, res, next) => {
	let body = req.body;

	/* istanbul ignore else */
	if (body) {
		// If a body exists, check there is a `body`, `name`, and `label`. If
		// any values are missing, throw an error and respond with a 400.
		// Otherwise, assign `body` to `req.code` for use by the compiler.
		try {
			if (!body.body) {
				throw new ValidateError(messages.NO_BODY, 'NO_BODY');
			} else if (!body.name) {
				throw new ValidateError(messages.NO_NAME, 'NO_NAME');
			} else if (!body.label) {
				throw new ValidateError(messages.NO_LABEL, 'NO_LABEL');
			} else {
				req.code = body.body;
			}
		} catch (e) {
			return new HttpError(e, e.errorType, 400).sendError(res);
		}

		return next();
	} else {
		// If a body is missing somehow, throw a generic error, log it, swallow
		// it, and respond with a 500.
		try {
			throw new Error('Missing request body.');
		} catch (e) {
			return new HttpError(e).sendError(res);
		} finally {
			return;
		}
	}
};

/**
 * @desc Proceeds to next function if no compiler error occured. If an error did
 * occur, it is normalised as an `HttpError`, including location information if
 * available, then sent with a 400 status code.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {function} next Function to be called by Express next.
 * @since 0.1.0
 */
const handleCompilerResult = (req, res, next) => {
	let err;

	try {
		if (req.compiler.error) {
			throw new HttpError(req.compiler.error, 'COMPILATION_ERROR', 400);
		}
	} catch (e) {
		err = e;
	} finally {
		if (err) {
			err.sendError(res);
			return;
		}
		next();
	}
};

/**
 * @desc Saves code resource to mongodb.  Sends 201 response if successful,
 * error response otherwise.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {function} next Function to be called by Express next.
 * @since 0.1.0
 */
const save = (req, res, next) => {
	let resource = {
		body: req.code,
		compiled: typeof req.compiler.compiled == 'function',
		label: req.body.label,
		name: req.body.name
	};

	let ceallogFunction = new CeallogFunction(resource);

	ceallogFunction.save((err, results) => {
		req.validator = {};

		let dbResult = dbResultCallback(req.validator)(err, results);

		/* istanbul ignore if */
		if (err) {
			try {
				throw new ValidateError(dbResult.message, dbResult.type);
			} catch (e) {
				return new HttpError(e, dbResult.type, dbResult.statusCode).sendError(
					res
				);
			}
		} else {
			let response = {
				compiled: true,
				id: results._id,
				label: results.label,
				message: dbResult.message,
				name: results.name,
				published: false,
				service: `/${settings.cealloga.api_path}/${
					settings.cealloga.test_path
				}/${results._id}`
			};
			
			req.cache.add(req.compiler.compiled, response);

			res.statusCode = 201;
			res.json(response);
		}
	});

	return;
};

/**
 * @desc Checks whether `req.body.name` is in the URI blacklist and proceeds if
 * not. Sends a 400 response otherwise.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {function} next Function to be called by Express next.
 * @since 0.1.0
 */
const validateURIBlacklist = (req, res, next) => {
	let name = req.body.name;
	
	if (!uriBlacklist.has(name)) {
		return next();
	} else {
		try {
			throw new ValidateError(messages.NAME_NOT_ALLOWED, 'NAME_NOT_ALLOWED');
		} catch(e) {
			new HttpError(e, e.errorType, 400).sendError(res);
		}
		return;
	}
};

/**
 * @desc Determines whether `req.body.name` is a valid URI component.
 * This function is a limitted implementation of the rules for RFC-2396: URI 
 * Generic Syntax (https://www.ietf.org/rfc/rfc2396.txt) as applied to relative
 * segment URI components (see section 5).
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {function} next Function to be called by Express next.
 * @since 0.1.0
 */
const validateURIComponent = (req, res, next) => {
	let name = req.body.name;
	let reserved = /[;\/\?\:@&=\+\$,]/g;
	let reservedMatch = reserved.exec(name);
	let relSegment = /[A-Za-z0-9-_\.\!~\*'\(\)%]*/g;
	let relSegmentMatch = relSegment.exec(name);
	let isValidSegment = relSegmentMatch && relSegmentMatch.index == 0 
		&& relSegment.lastIndex == name.length;
	
	if (!reservedMatch && isValidSegment) {
		return next();
	} else {
		try {
			throw new ValidateError(messages.INVALID_NAME, 'INVALID_NAME');
		} catch(e) {
			new HttpError(e, e.errorType, 400).sendError(res);
		}
		return;
	}

};

module.exports = [
	handleBody,
	validateURIComponent,
	validateURIBlacklist,
	compileRequest,
	handleCompilerResult,
	save
];
