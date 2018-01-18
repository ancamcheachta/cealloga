'use strict';

/**
 * @desc Error used by compiler
 * @extends {Error}
 * @since 0.1.0
 */
class CompilerError extends Error {
	/**
	 * @param {string} message Message used in error
	 * @param {Object} node (Optional) node from esprima tree used to
	 * define location information.
	 * @since 0.1.0
	 */
	constructor(message, node) {
		super(message);

		/**
		 * @type {string}
		 */
		this.name = this.constructor.name;

		Error.captureStackTrace(this, this.constructor);
		/**
		 * @type {Object}
		 */
		this.location =
			node && node.loc
				? node.loc
				: {
						start: {line: 0, column: 0},
						end: {line: 0, column: 0}
					};

		if (arguments.length > 2 && arguments[2] instanceof Error) {
			this.wrap(arguments[2]);
		}
	}
	/**
	 * @desc Determines if the compilation failure was due to an error during
	 * parsing. Sets location info from inner error if so.
	 * @param {Object} inner Error from esprima.
	 * @since 0.1.0
	 */
	wrap(inner) {
		let isParserError = 'index' in inner && 'lineNumber' in inner;

		if (isParserError) {
			this.location.end.column = -1;
			this.location.end.line = -1;
			this.location.start.column = inner.index;
			this.location.start.line = inner.lineNumber;
		}
	}
}

module.exports = CompilerError;
