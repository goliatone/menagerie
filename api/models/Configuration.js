'use strict';

/**
* Configuration.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var extend = require('gextend');
var BaseModel = require('../../lib/BaseModel');

var Configuration = {
    autoPK: true,
    nicename: 'Configuration',
    attributes: {
        uuid : {
            type: 'string'
            // primaryKey: true,
            // required: true
        },
        version:{
            type: 'int',
            defaultsTo: 0
        },
        name : {
            type: 'string'
        },
        description : {
            type: 'string'
        },
        device: {
            model: 'device'
        },
        data: {
            type: 'json'
        }
    },
    beforeUpdate: function(record, cb){
        record.version ++;
        cb();
    }
};



module.exports = extend({}, BaseModel, Configuration);
