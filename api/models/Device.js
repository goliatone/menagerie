/**
* Device.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var extend = require('gextend');
var BaseModel = require('../../lib/BaseModel');

var Device = {
    autoPK: true,
    nicename: 'Device',
    attributes: {
        uuid: {
            type: 'string',
            // primaryKey: true,
            // required: true
        },
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        status: {
            type: 'string'
        },
        type: {
            model:'deviceType'
        },
        location: {
            model: 'location'
        },
        configuration: {
            model: 'configuration'
        }
    }
};


module.exports = extend({}, BaseModel, Device);
