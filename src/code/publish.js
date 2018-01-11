/**
 * @desc Exports a router for `/code/publish/:id`, the service to publish the
 * code of a specified id.
 * @since 0.1.0
 */
'use strict';

/**
 * @ignore
 */
const CeallogFunction = require('../models/CeallogFunction'),
	compileRequest = require('../compiler').compileRequest,
	HttpError = require('../classes/HttpError'),
	PublishError = require('../classes/PublishError'),
	settings = require('../settings'),
	util = require('../mongoose-util');

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
 * @desc Attempts to find the existing published resource by the id provided. If
 * successful, the result is added to `req.publisher.newRecord`.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {function} next Function to be called by Express next.
 * @since 0.1.0
 */
const findNew = (req, res, next) => {
	let err;

	/* istanbul ignore else */
	if ('id' in req.params) {
		let id = util.getObjectId(req.params.id);

		req.publisher = req.publisher || {oldRecord: null, newRecord: null};

		CeallogFunction.findOne({_id: id}, (err, result) => {
			let dbResult = util.dbResultCallback(req.publisher)(err, result);

			if (dbResult.type == 'SUCCESS' && result) {
				req.publisher.newRecord = result;
				req.code = result.body;

				next();
			} else {
				try {
					throw new PublishError(
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
			throw new PublishError(messages.MISSING_PARAMS, 'MISSING_PARAMS');
		} catch (e) {
			err = new HttpError(e, e.errorType, 400);
			err.sendError(res);
		}
	}
};

/**
 * @desc Attempts to find the existing published resource by the name of the new
 * record.  If successful, the result is added to `req.publisher.oldRecord`.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {function} next Function to be called by Express next.
 * @since 0.1.0
 */
const findOld = (req, res, next) => {
	let publisher = req.publisher;
	let newRecord = publisher.newRecord;
	let name = newRecord ? newRecord.name : null;

	if (name) {
		let query = {
			$and: [{name: {$eq: name}}, {published: {$eq: true}}]
		};

		if (newRecord && newRecord._id) {
			query.$and.push({_id: {$ne: newRecord._id}});
		}


		CeallogFunction.findOne(query, (err, result) => {
			let dbResult = util.dbResultCallback(req.publisher)(err, result);

			if (dbResult.type == 'SUCCESS') {
				req.publisher.oldRecord = result;
			}

			next();
		});
	}
};

/**
 * @desc Compiles the new code before proceeding.
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
			let newRecord = req.publisher.newRecord || {};
			let id = newRecord._id;

			err.sendError(res);

			if (id) {
				CeallogFunction.update({_id: id}, {compiled: false, published: false});
			}

			return;
		}
		next();
	}
};

/**
 * @desc Updates the old record `published` field to `false` and the new record
 * `published` field to `true`.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {function} next Function to be called by Express next.
 * @since 0.1.0
 */
const update = (req, res, next) => {
	let newRecord = req.publisher.newRecord;
	let oldRecord = req.publisher.oldRecord;

	new Promise((resolve, reject) => {
		if (oldRecord) {
			return CeallogFunction.update(
				{_id: oldRecord._id},
				{published: false},
				(err, _) => {
					if (err) return reject(err);

					resolve();
				}
			);
		}
		resolve();
	})
		.then(_ => {
			return new Promise((resolve, reject) => {
				CeallogFunction.update(
					{_id: newRecord._id},
					{published: true},
					(err, _) => {
						if (err) return reject(err);

						resolve(newRecord);
					}
				);
			});
		})
		.then(r => {
			let response = {
				compiled: r.compiled,
				created_date: r.created_date,
				id: r._id,
				label: r.label,
				name: r.name,
				published: true,
				service: `/${settings.cealloga.api_path}/${r.name}`
			};

			res.statusCode = 200;
			res.json(response);
		})
		.catch(err => {
			/* istanbul ignore next */
			let dbResult = util.dbResultCallback(req.publisher)(err, null);
			
			/* istanbul ignore next */
			try {
				throw new PublishError(dbResult.type, dbResult.message);
			} catch (e) {
				new HttpError(e).sendError(res);
			}
		});
};

module.exports = [
	findNew,
	compileRequest,
	handleCompilerResult,
	findOld,
	update
];
