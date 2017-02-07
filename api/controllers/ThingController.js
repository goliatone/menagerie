'use strict';
var isUUID = require('../../lib/isUUID');
module.exports = {
    status: function(req, res){
        res.send(200);
    },
    find: function(req, res){
        var id = req.param('term');

        return Device.findOne(_getCriteria(id)).populateAll().then(function(result){

            if(!result){
                return Location.findOne({uuid:{like: id + '%'}}).populateAll().then(function(result){
                    if(!result) return res.ok({success: false, message: 'no record match'});
                    res.ok({success: true, type: 'location', result: result});
                }).catch(res.sendError);
            }

            res.ok({success: true, type: 'device', result: result});
        }).catch(res.sendError);
    },
    register: function(req, res){
        //Get the thing type
        var payload = req.params.all();

        //This should be coming from URL.
        var typeName = payload.typeName,
            id = payload.id;


        /*
         * When we register a device we have 3 cases:
         * - payload has a uuid
         *     - device exists
         *     - device does not exist
         * - payload has no uuid:
         *     - device does exist and has a UUID in DB
         *     - device does _NOT_ exist and has _NO_ UUID in DB
         *
         * If we print QR labels, then it means that
         * we have to tie an instance to a predefined
         * UUID.
         *
         * This means that we either provision the device
         * with this UUID or that we created a bunch of
         * devices to generate UUID labels. If that is the
         * case, then we need to be able to search by another
         * criteria and then replace the UUID? If that is true
         * then the UUID attribute can NOT be `primaryKey`.
         *
         */
        var criteria = {};
        criteria.uuid = id;

        var populate = {
            name: 'type',
            criteria: {
                where: {
                    name: typeName
                }
            }
        };

        //TODO: We should pluck data.
        var data = _getAttributes(payload);

        Device.updateOrCreate(criteria, data, populate).then(function(device){
            res.ok({
                status: true,
                record: device
            });
        }).catch(function(err){
            res.sendError(err);
        });
    },
    handleScann: function(req, res){
        console.log('HANDLE SCANN');
        //The payload we get from BarcodeScanner app:
        //{
        //  location: '7DABAAC0-2CCD-4406-8FBD-27C7BB5E4DF4',
        //  mac: '2CC5D3230740',
        //  assetTag: '016685'
        // }
        var locationUuid = req.param('location'),
            assetTag = req.param('assetTag'),
            /*
             * We renamed the attribute from
             * "alias" to "deviceId". Some
             * clients might be sending the old
             * name.
             */
            deviceId = req.param('deviceId');
            if(!deviceId) deviceId = req.param('alias');

        //A) Let's find a location with the given uuid.
        Location.findOne({where:{uuid:locationUuid}}).then(function(location){
            //TODO: Send valid KO
            if(!location) return res.ok({success: false, message: 'UUID did not match any records'});

            Device.update({assetTag: assetTag}, {
                location: location.id,
                deviceId: deviceId
            }).then(function(devices){
                //TODO: Send valid KO
                if(!devices || !devices.length) return res.ok({success: false, message: 'assetTag did not match any records'});

                var payload = {success:true, device: devices[0], location: location};

                sails.sockets.blast('/thing/barcode-scann', payload);

                console.log('BARCODE DONE', payload);

                res.ok(payload);

            }).catch(function(err){
                console.log('ERROR', err);
                var payload = {success:false, err: err.message, stack: err.stack};
                sails.sockets.blast('/thing/barcode-scann', payload);
                res.sendError(500);
            });
        }).catch(function(err){
            console.log('ERROR', err);
            var payload = {success:false, err: err.message, stack: err.stack};
            sails.sockets.blast('/barcode/barcode-scann', payload);
            res.sendError(500);
        });
    },
    _config:{}
};


function _getAttributes(src){
    var out = {};

    Object.keys(Device.attributes).map(function(key){
        out[key] = src[key];
    });

    return out;
}

function _getCriteria(id){
    return {
        where:{
            or:
                [
                    { id: id},
                    { uuid:{ like: id + '%' }},
                    { assetTag: id},
                    { deviceId: id}
                ]
            }
        };
}
