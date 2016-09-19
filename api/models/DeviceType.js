/**
* DeviceType.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var extend = require('gextend');
var BaseModel = require('../../lib/BaseModel');


var DeviceType = {
    autoPK: true,
    nicename: 'DeviceType',
    attributes: {
        name : {
            type: 'string',
            // primaryKey: true,
            // required: true
        },
        description : {
            type: 'string'
        },
        label : {
            type: 'string',
            //   trim: true, index: true
        },
        manufacturer: {
            type: 'string'
        },
        model: {
            type: 'string'
        },
        metadata : {
            type: 'json'
        },
        devices: {
            collection: 'device',
            via: 'type'
        }
    }
};

module.exports = extend({}, BaseModel, DeviceType);
