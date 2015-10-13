
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
            console.log('DEVICE', device)
            res.ok({
                status: 'OKIS',
                type: typeName,
                id: id,
                record: device
            });
        }).catch(function(err){
            res.sendError(err);
        });
    }
};
