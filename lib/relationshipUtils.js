'use strict';

/**
 * Returns an array with the relationships of the model. We can return either
 * the model name of each, or the alias.
 * We need the model name to build queries that load model instances, i.e for
 * HTML <select>s
 * We use the alias name to populate relationships on querying models.
 *
 * @param  {Object} definition          Waterline definition object
 * @param  {String} useModelNameOrAlias model|alias
 * @return {Array}                     Array containing the name of related entities
 */
module.exports.getRelationships = function $getRelationships(definition, modelNameOrAlias){
    modelNameOrAlias = modelNameOrAlias || 'alias';

    if(!modelNameOrAlias.match(/^alias$|^model$|^collection$/)) modelNameOrAlias = 'alias';

    var property,
        attribute,
        relationships = [];

    Object.keys(definition).map(function(key){
        attribute = definition[key];

        if(modelNameOrAlias === 'alias' && !attribute.hasOwnProperty(modelNameOrAlias)){
            return;
        }

        property = modelNameOrAlias;

        if(property === 'model'){
            if(!attribute[property]) property = 'collection';
        }

        if(!attribute[property]) return;

        relationships.push(attribute[property]);
    });

    return relationships;
};

//TODO: should we call it getRelationShipsByAlias
module.exports.getRelationshipsForPopulate = function $getRelationshipsForPopulate(definition){
    return module.exports.getRelationships(definition, 'alias');
};

//TODO: should we call it getRelationShipsByModel
module.exports.getRelationshipsForSelect = function $getRelationshipsForSelect(definition){
    return module.exports.getRelationships(definition, 'model');
};

module.exports.getEntityMetadata = function $getEntityMetadata(model){
    var metadata = model.attributes;

    return metadata;
};
