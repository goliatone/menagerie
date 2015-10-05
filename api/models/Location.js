/**
* Location.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var extend = require('gextend');
var BaseModel = require('../../lib/BaseModel');

var Location = {
    autoPK: true,
    attributes: {
        uuid : {
            type: 'string'
            // primaryKey: true,
            // required: true
        },
        name : {
            type: 'string'
        },
        description : {
            type: 'string'
        },
        geolocation : {
            lng: 'number',
            lat: 'number'
        },
        devices: {
            collection: 'device',
            via: 'location'
        }
    }
};

module.exports = extend({}, BaseModel, Location);
