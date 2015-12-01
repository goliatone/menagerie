if(process.env.NODE_ENV === 'production'){
    console.log('Initializing NewRelic agent');
    if(!process.env.NODE_NEWRELIC_KEY) console.error('NewRelic license key not found. Set NODE_NEWRELIC_KEY');

    //TODO: should we resolve path
    var resolve = require('path').resolve;
    console.log(__dirname + '/newrelic');
    console.log(resolve('./newrelic'));

    //TODO: We should figure out how to get this path!!
    process.env.NEW_RELIC_HOME = resolve(__dirname );
    global.newrelic = require('newrelic');
}
