'use strict';

module.exports = {
    afterExecute: request => {
        return;
    },
    beforeExecute: request => {
        this.variables(request.body);
    },
    extend: () => {
        let scope = this;
        
        scope.variables = variables => {
            scope._variables = variables || scope._variables || [];

            return scope._variables;
        };
    }
};
