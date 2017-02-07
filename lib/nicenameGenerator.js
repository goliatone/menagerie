'use strict';

//also: https://github.com/weaver/moniker
var goby;
var extend = require('gextend');
var normalizeName = require('./normalizeName');
var DEFAULTS = {
    decorator: function(pieces){
        return normalizeName(pieces.join(' '));
    }
};

module.exports.init = function(config){
    config = extend({}, DEFAULTS, config);

    goby = require('goby').init(config);

    return module.exports;
};

module.exports.generate = function(){
    return goby.generate(['adj', 'pre', 'suf']);
};
