'use strict';

var ObjectID = require('sails-mongo/node_modules/mongodb').ObjectID;

module.exports = {
    fromJSON: function(filepath){
        var json = require(filepath),
            Model;

        var keys = Object.keys(sails.models);

        function iterate(models, done){
            var key = models.pop();

            if(!key) return done();

            console.log('- Iterate over "%s"', key);

            Model = sails.models[key];

            if(!Model) return;

            function step(items, done){
                var record = items.pop();
                if(!record) return done();

                record = fixPrimaryKey(record);
                record = fixRelationshipKeys(record);

                //Since we use native we are loosing sails-mongo reconciliation
                //of id:string to _id:ObjectId
                Model.native(function(err, Collection){
                    Collection.update({
                        _id: record._id
                    },record, {upsert: true, w: 1}).then(function(){
                        step(items, done);
                    }).catch(function(err){
                        console.log('err', err.message);
                        step(items, done);
                    });
                });
            }

            step(json[key], function(){
                iterate(models, done);
            });
        }

        iterate(keys, function(){
            console.log('we are all done!');
        });
    }
};

function fixPrimaryKey(record){
    record._id = new ObjectID(record.id);
    delete record.id;
    return record;
}

function fixRelationshipKeys(record){
    var value;
    Object.keys(record).map(function(attr){

        value = record[attr];
        if(!value || !value.hasOwnProperty('__rel__')) return;
        record[attr] = new ObjectID(value.__rel__);
    });

    return record;
}
