'use strict';

/**
 * Deployment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
 var extend = require('gextend');
 var BaseModel = require('../../lib/BaseModel');

var Model = {

    attributes: {
        uuid: {
            type: 'string',
            // primaryKey: true,
            unique: true,
            required: true,
            defaultsTo: function(){
                return BaseModel.generateUUID();
            }
        },
        name: {
            type: 'string'
        },
        // slug:{
        //     type: 'string'
        // },
        description: {
            type: 'string'
        },
        startDate: {
            type: 'date'
        },
        endDate: {
            type: 'date'
        },
        location:{
            model: 'location'
        },
        devices: {
            collection: 'deployeddevice',
            via: 'deployment'
        }
    },
    beforeCreate: function(values, done){
        console.log('before create');
        values.slug = normalizeName(values.name);
        done();
    },
    beforeUpdate: function(values, done){
        console.log('before update');
        values.slug = normalizeName(values.name);
        done();
    }
};

module.exports = extend({}, BaseModel, Model);

function normalizeName(name){
    var slug = require('slug');
    return slug(name, {lower:true});
}
