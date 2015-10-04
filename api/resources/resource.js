function BaseResource(name){
    this.nicename = name.toLowerCase();
    this.baseView = this.nicename;
    this.label = name;
}

BaseResource.prototype.getViewPath = function(action){
    return action ? this.baseView + '/' + action : this.baseView;
};

BaseResource.prototype.getModel = function(){
    return sails.models[this.nicename];
};

function _uppercase(str){
   return str.charAt(0).toUpperCase() + str.slice(1, str.length);
}

module.exports = BaseResource;
