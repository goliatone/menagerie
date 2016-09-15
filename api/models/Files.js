'use strict';
/**
* Files.js
* Can't name it File.js because it conflicts with Socket.io, the
* global File object, and sails models...
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var BaseModel = require('../../lib/BaseModel');

module.exports = {

    attributes: {
        uuid : {
            uuidv4: true,
            unique: true,
            index: true,
            defaultsTo: function(){ return BaseModel._uuidGenerator().toUpperCase();},
            required: true
        },
        fd: {
            type: 'string'
        },
        size: {
            type: 'integer'
        },
        type: {
            type: 'string'
        },
        filename: {
            type: 'string'
        },
        uri: {
            type: 'string'
        }
    }
};
