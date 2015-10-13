
module.exports = {
    register: function(req, res){
        //Get the thing type
        var payload = req.params.all();

        var typeName = payload.typeName,
            id = payload.id;

        Device.findOne()
        .where({alias:id})
        .where({devicetype:{name:typeName}})
        .then(function(device){
            res.ok({
                status: 'OK',
                type: typeName,
                id: id,
                record: device
            });
        }).catch(function(err){
            res.sendError(err);
        });
    }
};
