/**
* Device.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var uuid = require('random-uuid-v4');
var parseModel = require('../node_modules/sails/lib/hooks/blueprints/actionUtil').parseModel;
module.exports = {
    autoPK: true,
    getEmptyObject: function(req){
        var Model = parseModel(req);
        var record = {},
            value;

        Object.keys(Model.attributes).map(function(key){
            record[key] = null;
        });

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
