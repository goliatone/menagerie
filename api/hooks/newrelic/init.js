if(process.env.NODE_ENV === 'production'){
    console.log('Initializing NewRelic agent');
    if(!process.env.NODE_NEWRELIC_KEY) console.error('NewRelic license key not found. Set NODE_NEWRELIC_KEY');
    process.env.NEW_RELIC_HOME = './config/newrelic';
    global.newrelic = require('newrelic');
}