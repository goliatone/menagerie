
'use strict';

/**
 * DeploymentController
 *
 * @description :: Server-side logic for managing Deployments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var helper = require('../../lib/relationshipUtils');
var BaseController = require('../../lib/BaseController')('Deployment');
var debug = require('debug')('controller:Deployment');
var extend = require('gextend');

var Controller = {
    floorplan: function(req, res){
        console.log('HERE, HERE, HERE');
        var id = req.param('id');

        Deployment.findOne({id: id}).populateAll().then(function(deployment){
            var features = [], detached = [];
            (deployment.devices || []).map(function(device){
                if(!device.coordinates) return detached.push({id: device.id, name: device.uuid, state: device.state});
                features.push({
                    id: device.id,
                    name: device.uuid,
                    coordinates: device.coordinates,
                    status: device.status //we should use DeployedDevice
                });
            });
            console.log('LOCATION', deployment.location.id);

            Location.findOne({id: deployment.location.id}).then(function(location){
                res.ok({
                    record: location,
                    title: 'Deployed Devices',
                    features: features,
                    detached: detached
                }, BaseController.Resource.getViewPath('floorplan'));
            }).catch(function(err){
                res.sendError(err);
            });
        }).catch(function(err){
            console.error('ERROR', err.message);
            console.error(err.stack);
            res.sendError(err);
        });
    },

    /*
     * Check in a device with a deployment.
     *
     * Deployment search criteria supports:
     * - full UUID
     * - partial UUID, from left to right
     * - name
     * - slug (norlamized name)
     *
     * TODO: What to do when a device is already checked-in?!
     */
    checkOut: function(req, res){

        var locationId = req.body.location,
            deploymentId = req.body.deployment,
            deviceId = req.body.device;

        var promises = [
            DeployedDevice.findOne(uuidShortCode(deviceId)).populateAll(),
            Location.findOne(uuidShortCode(locationId)),
            Deployment.findOne(deploymentCriteria(deploymentId)).populateAll(),
        ];

        function uuidShortCode(uuid, enabled){
            if(enabled === undefined ) enabled = sails.config.menagerie.enableUUIDShortCodes;
            if(enabled) return { uuid:{ like: uuid + '%' }};
            return {uuid: uuid};
        }

        Promise.all(promises).then(function(results){

            var device = results[0];
            var location = results[1];
            var deployment = results[2];

            if(!device){
                return res.ok({ok: false, err: 'No device'});
            }

            if(!device.deployment){
                return res.ok({ok: false, err: 'No deployment'});
            }

            //deploymentId could be a shortcode of deployment.uuid
            if(!device.deployment.uuid.match(new RegExp('^' + deploymentId))) {
                return res.ok({ok: false, err: 'Deployment does not match'});
            }

            /*
             * If our device has a location with a lower index
             * than the location of our deployment then we
             * know is an error.
             */
            if(location.index < deployment.location.index){
                return res.ok({ok: false, err: 'Location error'});
            }

            device.state = 'checkin';
            device.location = location.id;

            device.save(function(err){
                if(err) return res.ok({ok: false, err: err});
                res.ok({ok:true, device: device, args: arguments});
            });
        }).catch(function(err){
            console.error('here we have an error!', err.message);
            console.log(err.stack);
            res.serverError(err);
        });
    },
    checkOutForm: function(req, res){
        return res.ok({
            form:{
                action: '/' + BaseController.Resource.nicename + '/update',
                method: 'POST',
                intent: 'edit'
                //  method: 'PUT'
            },
            status: 'OK',
            title: 'Details',
            nicename: BaseController.Resource.nicename,
            metadata: BaseController.getMetadata('checkOutForm')
        }, BaseController.Resource.getViewPath('check-out'));
    },
    checkIn: function(req, res){
        res.send({ok: false, err: new Error('Not implemented')});
    },
    provision: function(req, res){
        if(!req.options.hasOwnProperty('limit')
            && !req.wantsJSON) req.options.limit = (sails.config.blueprints.clietRecordLimit || 10);

        var Resource = BaseController.Resource;

        var Model = Resource.getModel();

        var id = Model.getPk(req);

        var criteria = getCriteria(req);
        console.log('criteria', criteria);
        /*
         * We are picking up the deployment id
         * from the url, and messes up the criteria
         */
        delete criteria.id;

        var query = Device.find()
            .where(criteria)
            .limit(Resource.actionUtil.parseLimit(req))
            .skip(Resource.actionUtil.parseSkip(req))
            .sort(Resource.actionUtil.parseSort(req));

        query.populateAll();

        query.exec(function found(err, records){
            if(err) return res.negotiate(err);

            Model.findOne(id).then(function(deployment){
                return res.ok({
                    form: {
                        action: '/' + Resource.nicename,
                        method: 'POST',
                        intent: 'create'
                    },
                    record: deployment,
                    records: records,
                    criteria: criteria,
                    nicename: 'provision',
                    title: 'Details'
                }, Resource.getViewPath('provision'));
            }).catch(function(err){
                res.negotiate(err);
            });
        });
    },
    addDevices: function(req, res){
        var id = req.param('id'),
            ids = req.param('ids');

        console.log('id', id, 'ids', ids);

        //get current deployment
        console.log('get current deployment', id);
        Deployment.findOne(id).then(function(deployment){
            //get all devices.
            Device.find(ids).then(function(records){
                //manually filter those that have an undesired state
                var newRecords = [];
                records.map(function(r){
                    if(r.status !== 'inuse') newRecords.push(r);
                });
                //Create a DeployedDevice with status provisioned
                return DeployedDevice.createFromDevice(newRecords, deployment.id).then(function(deployed){
                    //Update Device status to reserved
                    return Device.update(ids, {status:'reserved'}).then(function(updated){
                        res.ok({ok: true, records: updated, deployed: deployed});
                    });
                });
            });
        }).catch(function(err){
            res.negotiate(err);
        });
    },
};

module.exports = extend({}, BaseController, Controller);


function getCriteria(req){
    /*
     * We can only pull in devices that are in specific
     * { or:[
         {status: {'like': 'inuse'}},
         {status: {'like': 'not_inuse'}}
         ]
     }
     */
    var def = {where: {status: 'available'}};
    var criteria = BaseController.Resource.actionUtil.parseCriteria(req);
    console.log('req criteria', criteria);
    criteria = extend(def, criteria);
    return criteria;
}



function deploymentCriteria(term){
    return {
        where:{
            or:
                [
                    { uuid:{ like: term + '%' }},
                    { name: term },
                    { slug: term }
                ]
            }
        };
}
