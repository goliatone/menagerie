'use strict';

function buildArguments(defaults) {
    var args = process.argv.slice(3),
        K = require('gkeypath');

    function dashToCamel(str) {
        if(!str) return '';

        return str.replace(/\W+(.)/g, function (x, chr) {
            return chr.toUpperCase();
        });
    }

    var key, value,
        argv = args.reduce(function(out, option) {
            option = option.replace('--', '');

            key = option.split('=')[0];

            key = dashToCamel(key);

            if (option.indexOf('=') === -1) value = true;
            else value = option.split('=')[1];

            typeof value === 'string' && (value = value.split(/,\s?/));

            if(Array.isArray(value) && value.length === 1) value = value[0];

            K.set(out, key, value);

            return out;
        }, {});

    return argv;
}


module.exports = buildArguments;
