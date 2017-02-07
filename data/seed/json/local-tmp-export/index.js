'use strict';

var ObjectID = require('sails-mongo/node_modules/mongodb').ObjectID;
//Read
var json = require('./local-tmp-export-raw.json');

clean(json);

mapIds(json);


//Transform
device(json);
devicetype(json);

//Save
save(json);


function clean(json){
    Object.keys(json).map(function(key){
        if(Array.isArray(json[key]) && json[key].length === 0){
            delete json[key];
        }
    });
}

function mapIds(json){
    var ids = {};

    var relationships = {
        device:{
            type: 'devicetype',
            location: 'location'
        },
        passport:{
            user: 'user'
        }
    };

    var models = Object.keys(json),
        items, model, map, rels;

    models.map(function(key){
        items = json[key];
        map = ids[key] = {};
        items.map(function(record){
            map[record.id] = {
                id: record.id,
                objectid: new ObjectID()
            };
        });
    });

    models.map(function(key){
        map = ids[key];
        items = json[key];
        rels = relationships[key] || {};
        items.map(function(record){
            record.id = map[record.id].objectid;
            // record._id = map[record.id].objectid;
            if(!!rels.length) return;

            Object.keys(rels).map(function(rel){
                if(!record[rel]) return;
                //record.type = ids['type'][1].objectid
                var relationName = rels[rel];
                var relationId = record[rel];

                /*
                 * If we are using sails-mongo to import
                 * the JSON it will deal with relationships,
                 * if we use MongoDB native's upsert then
                 * we have to map form id:String to _id:ObjectId
                 */
                record[rel] = {
                    __rel__ : ids[relationName][relationId].objectid
                };
            });
        });
    });
}

function device(items){
    items.__devicetype = {};

    items.device.map(function(device){
        device.deviceId = device.alias;

        if(device.type){
            var t = items.__devicetype[device.type];
            if(!t){
                t = items.__devicetype[device.type] = {};
            }

            if(device.model && t !== device.model){
                t.model = device.model;
            }

            if(device.manufacturer && t !== device.manufacturer){
                t.manufacturer = device.manufacturer;
            }
        }

        delete device.alias;
        delete device.model;
        delete device.manufacturer;
    });

    return items;
}

function devicetype(items){
    var data = items.__devicetype,
        attrs;
    items.devicetype.map(function(type){
        attrs = data[type.id];
        if(!attrs) return;
        type.model = attrs.model;
        type.manufacturer = attrs.manufacturer;
    });

    delete items.__devicetype;

    return items;
}

function save(json){
    var output = JSON.stringify(json, null, 4);
    console.log(output);
    require('fs').writeFileSync('./local-tmp-export.json', output, 'utf-8');
}
