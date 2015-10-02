'use strict';
/**
 * DeviceController
 *
 * @description :: Server-side logic for managing devices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var uuid = require('random-uuid-v4');
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');


module.exports = {
    create: function(req, res){
        var id = req.param('id');

        var locals = {
            resource: {
                uuid: uuid().toUpperCase()
            }
        };
        res.view('device/new',locals);
    },
    show: function(req, res){
        var id = req.param('id'),
            locals = {};

        if(id) {
            locals.id = id;
            Device.findOne({id:id})
            .populate('location', 'deviceType', 'configuration')
            .then(function(device){
                locals.resource = device;
                console.log('JSON', JSON.stringify(locals));
                res.view(locals);
            }).catch(function(err){
                locals.error = err;
                res.view(locals);
            });
        } else res.redirect('device', locals);
    },
    new: function(req, res){

        var locals = {
            record:{
                uuid: uuid().toUpperCase()
            },
            form:{
                action: '/device/new',
                method:'post'
            }
        };

        res.view(locals);
    },
    list: function(req, res){
        // Look up the model
        var Model = Device;


        // If an `id` param was specified, use the findOne blueprint action
        // to grab the particular instance with its primary key === the value
        // of the `id` param.   (mainly here for compatibility for 0.9, where
        // there was no separate `findOne` action)
        if ( actionUtil.parsePk(req) ) {
            return require('../../node_modules/sails/lib/hooks/blueprints/actions/findOne')(req,res);
        }

        // Lookup for records that match the specified criteria
        var query = Model.find()
            .where( actionUtil.parseCriteria(req) )
            .limit( actionUtil.parseLimit(req) )
            .skip( actionUtil.parseSkip(req) )
            .sort( actionUtil.parseSort(req) );

        query.populate('location', 'deviceType', 'configuration');

        // TODO: .populateEach(req.options);
        query = actionUtil.populateEach(query, req);
        query.exec(function found(err, matchingRecords) {
            if (err) return res.serverError(err);

            // Only `.watch()` for new instances of the model if
            // `autoWatch` is enabled.
            if (req._sails.hooks.pubsub && req.isSocket) {
                Model.subscribe(req, matchingRecords);
                if (req.options.autoWatch) { Model.watch(req); }
                // Also subscribe to instances of all associated models
                matchingRecords.map(function (record) {
                    actionUtil.subscribeDeep(req, record);
                });
          }

            res.view({records:matchingRecords});
        });
    }
};
