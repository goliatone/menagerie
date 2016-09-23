'use strict';

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
            type: 'string',
            // primaryKey: true,
            required: true
        },
        name : {
            type: 'string'
        },
        description : {
            type: 'string'
        },
        //Does this make sense here?
        geolocation_lng : {
            type: 'number',
        },
        geolocation_lat : {
            type: 'number',
        },
        floorplan: {
            //eventually this will be an image/file
            model: 'files',
        },
        devices: {
            collection: 'device',
            via: 'location'
        },
        deployments: {
            collection: 'deployment',
            via: 'location'
        },
        sublocations: {
            collection: 'location',
            via: 'parent'
        },
        parent: {
            model: 'location',
            via: 'sublocations'
        },
        assignParentLocation: function(parent){
            var L = sails.models.location;
            var updates = [
                L.update({id:this.id}, {parent: parent}),
                L.update({id: parent}, {sublocation: this.id})
            ];
            return Promise.all(updates);
        },
        assignSublocation: function(sub){
            var L = sails.models.location;
            var updates = [
                L.update({id: sub}, {parent: this.id}),
                L.update({id:this.id}, {sublocation: sub}),
            ];
            return Promise.all(updates);
        }
    },
    afterCreate: function(record, done){

        if(!record || !record.uuid){
            console.error('THIS SHOULD NEVER HAPPEN. We cannot have a Location instance without an UUID');
            return done();
        }

        var url = '' + record.uuid,
            filename = record.uuid;

        BarcodeService.createQRCode(url, filename).finally(function(){
            done();
        });
    }
};

module.exports = extend({}, BaseModel, Location);
