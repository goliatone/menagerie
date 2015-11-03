/**
 * Passport configuration
 *
 * This is the configuration for your Passport.js setup and where you
 * define the authentication strategies you want your application to employ.
 *
 * I have tested the service with all of the providers listed below - if you
 * come across a provider that for some reason doesn't work, feel free to open
 * an issue on GitHub.
 *
 * Also, authentication scopes can be set through the `scope` property.
 *
 * For more information on the available providers, check out:
 * http://passportjs.org/guide/providers/
 */

module.exports.passport = {
  local: {
    strategy: require('passport-local').Strategy
  },

  // bearer: {
  //   strategy: require('passport-http-bearer').Strategy
  // },
  google: {
    name: 'Google',
    protocol: 'oauth2',
    strategy: require('passport-google-oauth').OAuth2Strategy,
    options: {
      clientID: process.env.GOOGLE_CLIENT_ID || 'none',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'none',
      scope: ['profile', 'email'],
      //display:'popup',
      //hostedDomain: This is also duplicated on sails.config.auth.passport
      //hd: 'wework.com'
    }
  },
  /*
  cas: {
    name: 'CAS',
    protocol: 'cas',
    strategy: require('passport-cas').Strategy,
    options: {
      ssoBaseURL: 'http://your-cas-url',
      serverBaseURL: 'http://localhost:1337',
      serviceURL: 'http://localhost:1337/auth/cas/callback'
    }
  }
  */
};
