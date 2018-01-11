/**
 * @desc Compiler for most ceallog function api calls.
 * @since 0.1.0
 */
'use strict';

// Requirements
/**
 * @ignore
 */
const CompilerError = require('./classes/CompilerError'),
	esprima = require('esprima'),
	walk = require('esprima-walk');

// Constants
/**
 * @desc An object acting like a map where key represents the type of message
 * and the value is a string with the message itself.
 * @since 0.1.0
 */
const messages = {
	ILLEGAL_DIRNAME: 'Use of `__dirname` is illegal.',
	ILLEGAL_FILENAME: 'Use of `__filename` is illegal.',
	ILLEGAL_CLEARIMMEDIATE: 'Use of `clearImmediate()` is illegal.',
	ILLEGAL_CLEARINTERVAL: 'Use of `clearInterval()` is illegal.',
	ILLEGAL_CLEARTIMEOUT: 'Use of `clearTimeout()` is illegal.',
	ILLEGAL_CONSOLE: 'Use of `console` is illegal.',
	ILLEGAL_EXPORTS: 'Use of `exports` is illegal.',
	ILLEGAL_EVAL: 'Use of `eval()` is illegal.',
	ILLEGAL_GLOBAL: 'Use of `global` is illegal.',
	ILLEGAL_MODULE: 'Use of `module` is illegal.',
	ILLEGAL_PROCESS: 'Use of `process` is illegal.',
	ILLEGAL_REQUIRE: 'Use of `require()` is illegal.',
	ILLEGAL_SETIMMEDIATE: 'Use of `setImmediate()` is illegal.',
	ILLEGAL_SETINTERVAL: 'Use of `setInterval()` is illegal.',
	ILLEGAL_SETTIMEOUT: 'Use of `setTimeout()` is illegal.',
	ILLEGAL_THIS: 'Use of `this` keyword is illegal.',
	MULTIPLE_TOP_LEVEL_STATEMENTS:
		'Only one top-level statement permitted, and it must be an arrow function expression (eg. "() => { return \'Hello world\'; }").',
	NOT_A_FUNCTION: 'Statement is not a function.',
	NOT_AN_ARROW_FUNCTION:
		'Top level statement must be an arrow function (eg. "() => { return \'Hello world\'; }").',
	PARSER_FAILURE: 'Failed to parse statement.'
};

// Functions
/**
 * @param {string} code Code to compile.
 * @return {function} A closure function that takes a `Ceallog` instance as a
 * param. When this function is executed, it applies a `null` scope to the
 * compiled function and passes the `Ceallog` instance as its sole argument.
 * @since 0.1.0
 */
const compile = code => {
	let compiled = require('./safe-eval')(code);

	/* istanbul ignore if */
	if (typeof compiled != 'function') { // Unreachable...
		throw new Error(messages.NOT_A_FUNCTION);
	}

	let closure = function(ceallog) {
		return compiled.apply(null, [ceallog]);
	};

	return closure;
};

/**
 * @desc An object containg compiler fields and functions to be exported.
 * @since 0.1.0
 */
const compiler = {
	/**
	 * @see #messages
	 */
	_messages: messages,
	/**
	 * @desc Attempts to compile from string contained in `req.code`.  Adds
	 * results to `req.compiler.err` and `req.compiler.compiled` respectively.
	 * @param {Object} req Express request object
	 * @param {Object} res Express response object
	 * @param {function} next Function to be called by Express next.
	 * @since 0.1.0
	 */
	compileRequest: (req, res, next) => {
		req.compiler = {
			compiled: null,
			error: null
		};
		if (req.code) {
			compiler.compileString(req.code, (err, compiled) => {
				if (err) {
					req.compiler.error = err;
				} else {
					req.compiler.compiled = compiled;
				}
			});
		}
		next();
	},
	/**
	 * @param {string} code String containing code to be compiled
	 * @param {function} callback Function to which to pass the compilation
	 * results.  Function expected to include params `err` and `compiled`.
	 * @since 0.1.0
	 */
	compileString: (code, callback) => {
		let compiled, err;

		try {
			let ast = parse(code);
			validate(ast);
			compiled = compile(code);
		} catch (e) {
			err =
				e instanceof CompilerError ? e : new CompilerError(e.message, null, e);
		} finally {
			callback(err, compiled);
		}
	}
};

/**
 * @param {string} code String containing code to be parsed.
 * @return {Object} AST from `esprima` module.
 * @since 0.1.0
 */
const parse = code => {
	let ast = esprima.parse(code, {loc: true});
	return ast;
};

/**
 * @desc A shorthand function to throw a `CompilerError`
 * @param {string} message Message to include in `CompileError`.
 * @param {Object} node (Optional) node object from esprima where the failure
 * occurred.
 * @throws {CompilerError} Error with line location info if applicable.
 * @since 0.1.0
 */
const throwError = (message, node) => {
	let err = new CompilerError(message, node);
	throw err;
};

/**
 * @desc A void function that validates a ceallog function syntax tree based on
 * a series of rules, and throwing an error if not.
 * @param {Object} ast ceallog function abstract syntax tree to be validated.
 * @since 0.1.0
 */
const validate = ast => {
	if (ast) {
		if (ast.body.length > 1) {
			throw new Error(messages.MULTIPLE_TOP_LEVEL_STATEMENTS);
		} else if (
			0 in ast.body &&
			(!ast.body[0].expression ||
				ast.body[0].expression.type != 'ArrowFunctionExpression')
		) {
			throw new Error(messages.NOT_AN_ARROW_FUNCTION);
		}

		walk(ast, node => {
			let isIdentifier = node.type == 'Identifier';

			// Handle illegal identifiers
			if (isIdentifier) {
				switch (node.name) {
					case '__dirname':
						throwError(messages.ILLEGAL_DIRNAME, node);
					case '__filename':
						throwError(messages.ILLEGAL_FILENAME, node);
					case 'clearImmediate':
						throwError(messages.ILLEGAL_CLEARIMMEDIATE, node);
					case 'clearInterval':
						throwError(messages.ILLEGAL_CLEARINTERVAL, node);
					case 'clearTimeout':
						throwError(messages.ILLEGAL_CLEARTIMEOUT, node);
					case 'console':
						throwError(messages.ILLEGAL_CONSOLE, node);
					case 'exports':
						throwError(messages.ILLEGAL_EXPORTS, node);
					case 'global':
						throwError(messages.ILLEGAL_GLOBAL, node);
					case 'eval':
						throwError(messages.ILLEGAL_EVAL, node);
					case 'module':
						throwError(messages.ILLEGAL_MODULE, node);
					case 'process':
						throwError(messages.ILLEGAL_PROCESS, node);
					case 'require':
						throwError(messages.ILLEGAL_REQUIRE, node);
					case 'setImmediate':
						throwError(messages.ILLEGAL_SETIMMEDIATE, node);
					case 'setInterval':
						throwError(messages.ILLEGAL_SETINTERVAL, node);
					case 'setTimeout':
						throwError(messages.ILLEGAL_SETTIMEOUT, node);
				}

				if (node.name in process) {
					throwError(`Use of \`process.${node.name}\` is illegal.`, node);
				} else if (node.name in global) {
					throwError(`Use of identifier \`${node.name}\` is illegal.`, node);
				}
			} else if (node.type == 'ThisExpression') {
				throwError(messages.ILLEGAL_THIS, node);
			}
		});
	}
};

module.exports = compiler;
