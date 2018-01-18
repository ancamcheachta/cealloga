'use strict';

/**
 * @ignore
 */
const CompilerError = require('./CompilerError');

/**
 * @desc Normalised HTTP error class used prior to sending response.
 * @extends {Error}
 * @since 0.1.0
 */
class HttpError extends Error {
	/**
	 * @param {Error} inner Inner error specific to service (eg. 
	 * `ValidateError`).
	 * @param {string} errorType Type of error (eg. `'NAME_NOT_ALLOWED'`).
	 * @param {number} status Status code.
	 * @since 0.1.0
	 */
	constructor(inner, errorType, status) {
		super(inner.message);

		/**
		 * @type {string}
		 */
		this.name = this.constructor.name;
		/**
		 * @type {Error}
		 */
		this.inner = inner;

		/* istanbul ignore else */
		if (errorType && status) {
			/**
			 * @type {string}
			 */
			this.errorType = errorType;
			/**
			 * @type {string}
			 */
			this.status = status;
		} else {
			this.serverError();
		}

		this.defineBody();
	}
	/**
	 * @desc Composes a body for the HTTP response to be sent.  If the inner
	 * error was a `CompilerError`, it adds additional `compiled` and `location`
	 * fields to the body.  In all cases, `error_type` and `message` are taken
	 * from the current `HttpError` instance.
	 * @since 0.1.0
	 */
	defineBody() {
		/**
		 * @type {Object}
		 */
		this.body = {};
		this.body.error_type = this.errorType;
		this.body.message = this.message;

		if (this.inner instanceof CompilerError) {
			this.body.compiled = false;
			this.body.location = this.inner.location;
		}
	}
	/**
	 * @desc Overrides class instance variables to reflect internal server
	 * error.
	 * @since 0.1.0
	 */
	/* istanbul ignore next */
	serverError() {
		this.errorType = 'INTERNAL_SERVER_ERROR';
		/**
		 * @type {string}
		 */
		this.message = 'An unknown exception occurred.';
		this.status = 500;
	}
	/**
	 * @desc Sets `res.statusCode` with current instance `status` and sends a
	 * json response with the current instance `body`.
	 * @param {Object} res Express response object.
	 */
	sendError(res) {
		res.statusCode = this.status;
		res.json(this.body);
	}
}

module.exports = HttpError;
