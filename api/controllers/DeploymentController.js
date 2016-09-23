/**
 * DeploymentController
 *
 * @description :: Server-side logic for managing Deployments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var BaseController = require('../../lib/BaseController')('Deployment');
var debug = require('debug')('controller:Deployment');
var extend = require('gextend');

var Controller = {
    provision: function(req, res){
        var Resource = BaseController.Resource;

        var Model = Resource.getModel();

        var id = Model.getPk(req);

        var query = Model.find()
            .where(Resource.actionUtil.parseCriteria(req))
            .limit(Resource.actionUtil.parseLimit(req))
            .skip(Resource.actionUtil.parseSkip(req))
            .sort(Resource.actionUtil.parseSort(req));

        query = Resource.populateEach(query, req);

        query.exec(function found(err, records){
            if(err) return res.negotiate(err);

            //this is probably not going to be called since it's
            //not a standard get/post/push to deployment
            if(req._sails.hooks.pubsub && req.isSocket){
                Model.subscribe(req, records);
                if(req.options.autoWatch) { Model.watch(req);}
                (records || []).map(function(record){
                    Resource.actionUtil.subscribeDeep(req, record);
                });
            }
            Model.findOne(id).then(function(deployment){
                return res.ok({
                    form: {
                        action: '/' + Resource.nicename,
                        method: 'POST',
                        intent: 'create'
                    },
                    record: deployment,
                    records: records,
                    nicename: 'provision',
                    title: 'Details'
                }, Resource.getViewPath('provision'));
            }).catch(function(err){
                res.negotiate(err);
            });
        });
    }
};

module.exports = extend({}, BaseController, Controller);
