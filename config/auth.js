'use strict';

module.exports.auth = {
    loginRedirect: '/dashboard',
    passport: {
        authenticateDomain: function(user){
            if(!user.email) return false;
            var domain = user.email.split('@')[1];
            var hostedDomain = sails.config.auth.passport.restrictToDomain;
            hostedDomain = hostedDomain.replace('www.', '');
            return domain === hostedDomain;
        },
        restrictToDomain: 'wework.com'
    }
};
