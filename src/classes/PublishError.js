'use strict';

/**
 * @desc Error used by publisher router
 * @extends {Error}
 * @since 0.1.0
 */
class PublishError extends Error {
	/**
	 * @desc Calls parent constructor, resets name, adds errorType, and captures
	 * stack trace.
	 * @param {string} message Error message
	 * @param {string} errorType Error type
	 * @since 0.1.0
	 */
	constructor(message, errorType) {
		super(message);

		/**
		 * @type {string}
		 */
		this.errorType = errorType;
		/**
		 * @type {string}
		 */
		this.name = this.constructor.name;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = PublishError;
