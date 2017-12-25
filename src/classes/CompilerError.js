'use strict';

class CompilerError extends Error {
    constructor(message, node) {
        super(message);
        
        this.name = this.constructor.name;
        
        Error.captureStackTrace(this, this.constructor);
        
        this.location = node && node.loc ? node.loc : {
            start: { line: 0, column: 0 },
            end: { line: 0, column: 0 }
        };
        
        if(arguments.length > 2 && arguments[2] instanceof Error) {
            this.wrap(arguments[2]);
        }
    }
    wrap(inner) {
        let isParserError = 'index' in inner && 'lineNumber' in inner;
        
        if(isParserError) {
            this.location.end.column = -1;
            this.location.end.line = -1;
            this.location.start.column = inner.index;
            this.location.start.line = inner.lineNumber;
        }
    }
}

module.exports = CompilerError;
