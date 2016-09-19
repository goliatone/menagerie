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
                //If we store a string, it will crapola...
                record._id =
                record.id = new ObjectID(record.id);
                Model.native(function(err, Collection){
                    Collection.update({
                        id: record.id
                    },
                    { $set: record },
                    {
                        upsert:true
                    }).then(function(){
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
