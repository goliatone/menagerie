'use strict';
/*
 * Bearer Authentication Protocol
 *
 * Bearer Authentication is for authorizing API requests. Once
 * a user is created, a token is also generated for that user
 * in its passport. This token can be used to authenticate
 * API requests.
 *
 */
var debug = require('debug')('passport:bearer');
exports.authorize = function(token, done) {
    debug('BEARER, GET TOKEN ', token);

    Passport.findOne({ accessToken: token }).exec(function(err, passport) {
        if (err) { return done(err); }
        if (!passport) { return done(null, false); }
        User.findOneById(passport.user, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user, { scope: 'all' });
        });
    });
};
