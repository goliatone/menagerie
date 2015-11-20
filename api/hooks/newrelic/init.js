if(process.env.NODE_ENV === 'production'){
    console.log('Initializing NewRelic agent');
    process.env.NEW_RELIC_HOME = './config/newrelic';
    global.newrelic = require('newrelic');
}