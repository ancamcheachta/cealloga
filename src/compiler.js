'use strict';

// Requirements
const CompilerError = require('./classes/CompilerError');
const esprima = require('esprima');
const walk = require('esprima-walk');

// Constants
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
    MULTIPLE_TOP_LEVEL_STATEMENTS: 'Only one top-level statement permitted, and it must be an arrow function expression (eg. "() => { return \'Hello world\'; }").',
    NOT_A_FUNCTION: 'Statement is not a function.',
    NOT_AN_ARROW_FUNCTION: 'Top level statement must be an arrow function (eg. "() => { return \'Hello world\'; }").',
    PARSER_FAILURE: 'Failed to parse statement.'
};

// Functions
const compile = (code) => {
    let compiled = require('./safe-eval')(code);
    
    if(typeof compiled != 'function') {
        throw new Error(messages.NOT_A_FUNCTION);
    }
    
    let closure = function(ceallog) {
        return compiled.apply(null, [ceallog]);
    };
    
    return closure;
};

const compiler = {
    _messages: messages,
    
    compileRequest: (req, res, next) => {
        req.compiler = {
            compiled: null,
            error: null
        };
        if(req.code) {
            compiler.compileString(req.code, (err, compiled) => {
                if(err) {
                    req.compiler.error = err;
                } else {
                    req.compiler.compiled = compiled;
                }
            });
        }
        next();
    },
    compileString: (code, callback) => {
        let compiled, err;
        
        try {
            let ast = parse(code);
            validate(ast);
            compiled = compile(code);
        } catch(e) {
            err = e instanceof CompilerError ? e : new CompilerError(e.message, null, e);
        } finally {
            callback(err, compiled);
        }
    }
};

const parse = (code) => {
    let ast = esprima.parse(code, { loc: true });
    return ast;
};

const throwError = (message, node) => {
    let err = new CompilerError(message, node);
    throw err;
};

const validate = (ast) => {
    if(ast) {
        if(ast.body.length > 1) {
            throw new Error(messages.MULTIPLE_TOP_LEVEL_STATEMENTS);
        } else if(0 in ast.body && (!ast.body[0].expression || ast.body[0].expression.type != 'ArrowFunctionExpression')) {
            throw new Error(messages.NOT_AN_ARROW_FUNCTION);
        }
        
        walk(ast, (node) => {
            let isIdentifier = node.type == 'Identifier';
            
            // Handle illegal identifiers
            if(isIdentifier) {
                switch(node.name) {
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
                
                if(node.name in process) {
                    throwError(`Use of \`process.${node.name}\` is illegal.`, node);
                } else if(node.name in global) {
                    throwError(`Use of identifier \`${node.name}\` is illegal.`, node);
                }
            } else if(node.type == 'ThisExpression') {
                throwError(messages.ILLEGAL_THIS, node);
            }
        });
    }
};

module.exports = compiler;
