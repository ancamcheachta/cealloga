'use strict';

const assert = require('assert');
const Ceallog = require('../src/classes/Ceallog');
const compiler = require('../src/compiler');
const messages = compiler._messages;

describe('compiler', () => {
    describe('#compileString()', () => {
        it('should complain if the code fails to parse', () => {
            let code = '() => { aaaaasdf ';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, 'Line 1: Unexpected end of input');
                assert.equal(err.location.start.line, 1);
                assert.equal(err.location.start.column, 17);
                assert.equal(err.location.end.line, -1);
                assert.equal(err.location.end.column, -1);
            });
        });
        
        it('should complain if there are multiple top-level statements', () => {
            let code = 'let a = () => { return []; }; let b = "more code";';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.MULTIPLE_TOP_LEVEL_STATEMENTS);
            });
        });
        
        it('should complain if the top level statement is not an arrow function', () => {
            let code = 'var notAFunction = "this is not a function";';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.NOT_AN_ARROW_FUNCTION);
            });
        });
        
        it('should complain if the function uses `__dirname`', () => {
            let code = '() => { return [__dirname]; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_DIRNAME);
            });
        });
        
        it('should complain if the function uses `__filename`', () => {
            let code = '() => { return [__filename]; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_FILENAME);
            });
        });
        
        it('should complain if the function uses `clearImmediate`', () => {
            let code = '() => { clearImmediate(); return []; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_CLEARIMMEDIATE);
            });
        });
        
        it('should complain if the function uses `clearInterval`', () => {
            let code = '() => { clearInterval(); return []; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_CLEARINTERVAL);
            });
        });
        
        it('should complain if the function uses `clearTimeout`', () => {
            let code = '() => { clearTimeout(); return []; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_CLEARTIMEOUT);
            });
        });
        
        it('should complain if the function uses `console`', () => {
            let code = '() => { console.log("illegal"); return []; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_CONSOLE);
            });
        });
        
        it('should complain if the function uses `exports`', () => {
            let code = '() => { exports = {}; return []; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_EXPORTS);
            });
        });
        
        it('should complain if the function uses `global`', () => {
            let code = '() => { return [global]; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_GLOBAL);
            });
        });
        
        it('should complain if the function uses `eval`', () => {
            let code = '() => { eval("let a = true"); return []; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_EVAL);
            });
        });
        
        it('should complain if the function uses `module`', () => {
            let code = '() => { return [module]; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_MODULE);
            });
        });
        
        it('should complain if the function uses `process`', () => {
            let code = '() => { return [process]; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_PROCESS);
            });
        });
        
        it('should complain if the function uses `require`', () => {
            let code = '() => { let fs = require("fs"); return []; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_REQUIRE);
            });
        });

        it('should complain if the function uses `setImmediate`', () => {
            let code = '() => { setImmediate(); return []; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_SETIMMEDIATE);
            });
        });

        it('should complain if the function uses `setInterval`', () => {
            let code = '() => { setInterval(); return []; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_SETINTERVAL);
            });
        });
        
        it('should complain if the function uses `setTimeout`', () => {
            let code = '() => { setTimeout(); return []; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_SETTIMEOUT);
            });
        });
        
        it('should complain if the function uses `this`', () => {
            let code = '() => { return [this]; }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, messages.ILLEGAL_THIS);
            });
        });
        
        it('should complain if the function uses `process` member', () => {
            let code = '() => { exit(); }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, 'Use of `process.exit` is illegal.');
            });
        });
        
        it('should complain if the function uses `global` member', () => {
            let code = '() => { new Promise(); }';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, 'Use of identifier `Promise` is illegal.');
            });
        });

        it('should compile a function that returns an array', () => {
            let code = '() => { return ["a","b","c"]; }';
            
            compiler.compileString(code, (err, compiled) => {
                if(err) throw err;
                assert.equal(compiled()[1], 'b');
            });
        });

        it('should compile a function that takes `ceallog` argument', () => {
            let code = '(ceallog) => { return ceallog.variables.test; }';
            
            compiler.compileString(code, (err, compiled) => {
                let ceallog = new Ceallog();
                
                ceallog.setVariables({ test: 'Hello world' });
                
                if(err) throw err;
                
                assert.equal(compiled(ceallog), 'Hello world');
            });
        });
        
        it('should not leak private `compiler` variables', () => {
            let code = '(ceallog) => {' +
                '\n\tlet a = messages; // `messages` is a private variable of `compiler` module' +
                '\n}';
            
            compiler.compileString(code, (err, compiled) => {
                let ceallog = new Ceallog();
                let executed;
                
                if(err) throw err;
                
                try {
                    executed = compiled(ceallog);
                } catch(e) {
                    assert.equal(e.message, 'messages is not defined');
                } finally {
                    assert.notEqual(executed, compiler._messages);
                }
            });
        });
        
        it('should not leak local variables', () => {
            let localVar = 'Accessing me is not allowed.';
            let code = '(ceallog) => {' +
                '\n\tlet a = localVar;' +
                '\n\treturn a;' +
                '\n}';
            
            compiler.compileString(code, (err, compiled) => {
                let ceallog = new Ceallog();
                let executed;
                
                if(err) throw err;
                
                try {
                    executed = compiled(ceallog);
                } catch(e) {
                    assert.equal(e.message, 'localVar is not defined');
                } finally {
                    assert.notEqual(executed, localVar);
                }
            });
        });
        
        it('should not leak stack traces', () => {
            let code = '() => {' +
                '\n\tlet e = new Error();' +
                '\n\treturn e.stack;' +
                '}';
            
            compiler.compileString(code, (err, compiled) => {
                assert.equal(err.message, 'Use of identifier `Error` is illegal.');
            });
        });

    });
});
