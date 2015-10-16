'use strict';

module.exports = {
    register: function(req, res){
        //Get the thing type
        var payload = req.params.all();

        var typeName = payload.typeName,
            id = payload.id;

        var query = Device.findOne();
        query.where({alias:id});
        query.populate('type', {where:{name:typeName}});
        query.then(function(device){
            console.log('DEVICE', device);
            res.ok({
                status: 'OKIS',
                type: typeName,
                id: id,
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
		// 	location: '7DABAAC0-2CCD-4406-8FBD-27C7BB5E4DF4',
		// 	mac: '2CC5D3230740',
		// 	assetTag: '016685'
		// }
		var locationUuid = req.param('location'),
            assetTag = req.param('assetTag'),
            alias = req.param('alias');

        //A) Let's find a location with the given uuid.
        Location.findOne({where:{uuid:locationUuid}}).then(function(location){
            //TODO: Send valid KO
            if(!location) return res.ok({success: false, message: 'UUID did not match any records'});

            Device.update({assetTag: assetTag}, {
                location: location.id,
                alias: alias
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
