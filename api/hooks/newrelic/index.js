'use strict';
var toolbar = require('express-debug');
var debug = require('debug')('hook:debugtoolbar');

module.exports = function treehugger(sails){

    return {
        ready: false,
        initialize: function(done){
            if(!process.env.NODE_NEWRELIC_KEY) return done();

            var envCheck = sails.config.environment === 'production';
            if(!envCheck) return done();

            /*
             * we are supposed to use this on the header of
             * our layout. This should be a locals function
             * or available for EJS.
             */
            sails.newRelicBrowserHeader = function(){
                if(envCheck) sails.newrelic.getBrowserTimingHeader();
            };

            sails.newrelic = global.newrelic;
            delete global.newrelic;
            sails.on('router:route', function(route){
                if(sails.newrelic && route.req.options && route.req.options.controller){
                    return sails.newrelic.setControllerName(route.req.options.controller, route.req.options.action);
                }
            });
            return done();
        }
    };
};
