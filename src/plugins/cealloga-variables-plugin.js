/**
 * @desc A plugin used to retrieve variables from a Express request body and add
 * them to the `Ceallog` instance in scope.
 * @since 0.2.0
 */
'use strict';

module.exports = {
    /* istanbul ignore next */
    afterExecute: request => {
        return;
    },
    /**
     * @desc Sets the `_variables` for the `Ceallog` in scope with the value of
     * `request.body`.
     * @param {Object} request Express request object.
     * @since 0.2.0
     */
    beforeExecute: request => {
        this.variables(request.body);
    },
    /**
     * @desc Extends the `Ceallog` in scope to include a function called
     * `variables()`;
     * @param {Object} request Express request object.
     * @since 0.2.0
     */
    extend: () => {
        let scope = this;
        
        scope.variables = variables => {
            scope._variables = variables || scope._variables || {};

            return scope._variables;
        };
    }
};
