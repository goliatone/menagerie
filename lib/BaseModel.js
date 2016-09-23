'use strict';

/**
* Device.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var uuid = require('random-uuid-v4');
var parseModel = require('../node_modules/sails/lib/hooks/blueprints/actionUtil').parseModel;
var Promise = require('bluebird');
var extend = require('gextend');


module.exports = {
    _uuidGenerator: uuid,
    autoPK: true,
    updateOrCreate: function(criteria, data, populate, cb){

        var that = this;

        if(typeof populate === 'function') {
            cb = populate;
            populate = undefined;
        }


        cb = cb || function(){};

        return new Promise(function(resolve, reject){
            var query = that.findOne();
            query.where(criteria);
            if(populate) query.populate(populate.name, populate.criteria);
            query.then(function(model){
                if(model){
                    model = extend(model, data);
                    model.save(function(){
                        resolve(model);
                        cb(null, model);
                    });
                } else {
                    that.create(data).then(function(){
                        resolve(model);
                        cb(null, model);
                    }).catch(function(err){
                        reject(err);
                        cb(err);
                    });
                }
            }).catch(function(err){
                reject(err);
                cb(err);
            });
        });
    },
    generateUUID: function(){
        return uuid().toUpperCase();
    },
    getEmptyObject: function(req){
        var Model = parseModel(req);
        var record = {},
            value;

        Object.keys(Model.attributes).map(function(key){
            record[key] = null;
        });

        //TODO: Formalize this :)
        if(Model.attributes.hasOwnProperty('uuid')){
            record.uuid = uuid().toUpperCase();
        }

        return record;
    },
    getParametersFromRequest: function(req, removePrimaryKey){
        var Model = parseModel(req);
        var record = {},
            value;

        Object.keys(Model.attributes).map(function(key){
            value = req.param(key);
            if(!value) return;
            record[key] = value;
        });

        if(removePrimaryKey){
            var pk = Model.primaryKey;
            delete record[pk];
        }

        //TODO: We do this now before we
        if(removePrimaryKey && record.hasOwnProperty('uuid')){
            delete record.uuid;
        }

        return record;
    },
    findByIdFromRequest: function(req){
        var Model = parseModel(req);
        var pk = Model.primaryKey;
        var query = {};
        query[pk] = req.param(pk);
        return Model.findOne(query);
    },
    getPk: function(req){
        var key = parseModel(req).primaryKey;
        var pk = req.options[key] || (req.options.where && req.options.where[key]) || req.param(key);
        pk = typeof pk === 'object' ? undefined : pk;
        return pk;
    }
};
