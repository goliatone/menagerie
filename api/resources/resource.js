'use strict';

var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

function BaseResource(name){
    this.nicename = name.toLowerCase();
    this.baseView = this.nicename;
    this.label = name;
    this.validateModel();
}

BaseResource.prototype.validateModel = function(){
    if(!sails.models[this.nicename]){
        throw Error('BaseResource for ' + this.nicename + ' its not a model');
    }

    if(!sails.models[this.nicename].__basemodel__){
        throw Error('BaseResource for ' + this.nicename + ' doest not extend BaseModel');
    }
};

BaseResource.prototype.getViewPath = function(action){
    return action ? this.baseView + '/' + action : this.baseView;
};

BaseResource.prototype.getModel = function(){
    return sails.models[this.nicename];
};

BaseResource.prototype.actionUtil = actionUtil;
BaseResource.prototype.parsePk = actionUtil.parsePk;
BaseResource.prototype.parseValues = actionUtil.parseValues;
BaseResource.prototype.populateEach = require('../../lib/populateEach');

function _uppercase(str){
   return str.charAt(0).toUpperCase() + str.slice(1, str.length);
}

module.exports = BaseResource;
