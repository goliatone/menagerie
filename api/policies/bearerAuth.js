/**
 * bearerAuth Policy
 *
 * Policy for authorizing API requests. The request is authenticated if the
 * it contains the accessToken in header, body or as a query param.
 * Unlike other strategies bearer doesn't require a session.
 * Add this policy (in config/policies.js) to controller actions which are not
 * accessed through a session. For example: API request from another client
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */

module.exports = function (req, res, next) {
    console.log('BEARER POLICY');

    /*goliatone GENERATED CODE...*/
    if(req.wantsJSON){ //TODO: we should/could add isSocket here?
        return passport.authenticate('bearer', { session: false })(req, res, next);
    }
    /*goliatone GENERATED CODE...*/
    next();
};
