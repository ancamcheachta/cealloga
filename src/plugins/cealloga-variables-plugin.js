/**
 * @desc A plugin used to retrieve variables from a Express request body and add
 * them to the `Ceallog` instance in scope.
 * @since 0.2.0
 */
'use strict';

module.exports = {
    afterExecute: function(response) {
        /* istanbul ignore next */
        return;
    },
    /**
     * @desc Sets the `vars` for the `Ceallog` in scope with the value of
     * `request.body`.
     * @param {Object} request Express request object.
     * @since 0.2.0
     */
    beforeExecute: function(request) {
        this.variables(request.body);
    },
    /**
     * @desc Extends the `Ceallog` in scope to include a function called
     * `variables()`;
     * @param {Object} request Express request object.
     * @since 0.2.0
     */
    extend: function() {
        let scope = this;
        
        scope.variables = function(variables) {
            scope.vars = variables || scope.vars || {};

            return scope.vars;
        };
    }
};
