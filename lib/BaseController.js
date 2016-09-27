'use strict';
var extend = require('gextend');

module.exports = function(recourceName){

    var debug = require('debug')('controller:' + recourceName + 'Controller');

    var Resource = require('../api/resources')(recourceName);

    var BaseController = {
        __basecontroller__: true,
        getMetadata: function(action, req, url){
            return {};
        },
        /**
         * `BaseController.create()`
         */
        create: function (req, res) {

            var Model = Resource.getModel();

            //  debug('Inside create..............req.params = ' + JSON.stringify(req.params.all()));

            var payload = Model.getParametersFromRequest(req, false);
            debug('Inside create..............req.params = ' + JSON.stringify(payload));

            return Model.create(payload).exec(function created(err, instance){
                if(err) return res.negotiate(err);

                if(req._sails.hooks.pubsub){
                    if(req.isSocket){
                        Model.subscribe(req, instance);
                        Model.introduce(instance);
                    }
                    Model.publishCreate(instance.toJSON(), !req.options.mirror && req);
                }
                //we should actually redirect if we expect HTML or just return JSON
                if(req.explicitlyAcceptsHTML) res.redirect(Resource.baseView);
                else res.created(instance);
            });
        },
        /**
         * `BaseController.update()`
         */
        update: function (req, res) {
            var Model = Resource.getModel();

            var id = Model.getPk(req),
            payload = Model.getParametersFromRequest(req, true);


            debug('Inside record %s update..............req.params = %s', id, JSON.stringify(payload));

            /*Model.findOne(id).populateAll().exec(function(err, record){
                if(err) return res.serverError(err);
                if(!record) return res.notFound();

                Model.update({id:id}, payload).exec(function(err, records){
                    if(err) return res.negotiate(err);
                    if(!records || !records.length || records.length > 1){
                         req._sails.log.warn('Unexpected output from `' + Model.globalId + '`.');
                     }

                     var updatedRecord = records[0];
                     if(req._sails.hooks.pubsub){
                         if(req.isSocket){Model.subscribe(req, records);}
                         Model.publishUpdate(id, extend({}, payload), !req.options.mirror && req, {
                            previous: extend({}, updatedRecord)
                         });
                     }

                     //Populate associated models:
                     var promise = Model.findOne(updatedRecord[Model.primaryKey]);
                     promise = Resource.populateEach(promise, req);
                     promise.exec(function foundAgain(err, populatedRecord){
                        if(err) return res.sendError(err);
                        if(!populatedRecord) return res.serverError('Could not find a record after update');
                        res.ok(populatedRecord);
                        // res.ok(Resource.baseView);
                     });
                 });
             });*/

            return Model.update({id: id}, payload).then(function (record) {
                debug('Device update: ' + JSON.stringify(record));
                //  return res.redirect(Resource.baseView);
                if(req._sails.hooks.pubsub){
                    if(req.isSocket){
                        Model.subscribe(req, record);
                    }

                    Model.publishUpdate(id, extend({}, payload), !req.options.mirror && req, {
                       previous: extend({}, record)
                    });
                }

                return res.redirect(Resource.getViewPath());
             }).catch(function (err) {
                console.error('Error on Resource.update');
                console.error(err);

                return Model.findByIdFromRequest(req).then(function (record) {
                    if (record) {//TODO: We should just return value and have client validate
                        return res.ok({
                            record: record,
                            status: 'Error',
                            errorType: 'validation-error',
                            statusDescription: err,
                            title: 'Details',
                            metadata: getMetadata('update'),
                         }, Resource.getViewPath('edit'));
                    } else {
                        return res.ok({message: 'Sorry, no resource found with id - ' + req.param('id')}, '500');
                    }
                }).catch(function (err) {
                    return res.ok({message: 'Sorry, no resource found with id - ' + req.param('id')}, '500');
                });
            });
         },
        /**
         * `BaseController.delete()`
         */
        delete: function (req, res) {
            debug('Inside delete..............');

            var Model = Resource.getModel();
            var pk = Resource.actionUtil.requirePk(req);

            var query = Model.findOne(pk);
            query = Resource.populateEach(query, req);

            query.exec(function foundRecord(err, record){
                if(err) return res.serverError(err);
                if(!record) return res.notFound('No record found with the specified `pk`.');

                Model.destroy(pk).exec(function destroyedRecord(err){
                    if(err) return res.negotiate(err);
                    if(sails.hooks.pubsub){
                        Model.publishDestroy(pk, !sails.config.blueprints.mirror && req, {previous: record});
                        if(req.isSocket){
                            Model.unsubscribe(req, record);
                            Model.retire(record);
                        }
                    }
                    return res.redirect(Resource.getViewPath());
                });
            });
         },
        /**
         * `BaseController.find()`
         */
        find: function (req, res) {
            var Model = Resource.getModel();

            var id = req.params.id;
            debug('Inside find.............. id = ' + id);
            console.log('FIND', req.query.trigger, req.params);

            var query = Model.findByIdFromRequest(req);
            query = Resource.populateEach(query, req);
            query.exec(function(err, matchingRecord){
                if(err) return res.negotiate(err);
                if(!matchingRecord) return res.notFound('No record found with the specified `pk`.');

                if(sails.hooks.pubsub && req.isSocket){
                    Model.subscribe(req, matchingRecord);
                    Resource.actionUtil.subscribeDeep(req, matchingRecord);
                }

                debug('Inside find Found .... record = ' + JSON.stringify(matchingRecord));
                return res.ok({
                    form:{
                        action: '/' + Resource.nicename + '/update',
                        method: 'POST',
                        intent: 'edit'
                        //  method: 'PUT'
                    },
                    status: 'OK',
                    title: 'Details',
                    nicename: Resource.nicename,
                    record: matchingRecordm,
                    metadata: getMetadata('find')
                }, Resource.getViewPath('edit'));
            });
         },
        /**
          * `BaseController.findall()`
         */
        findall: function (req, res) {

            var Model = Resource.getModel();
            debug('Inside findall..............');
            console.log('FIND', req.query.trigger, req.params);
            if(!req.options.hasOwnProperty('limit')
                && !req.wantsJSON) req.options.limit = (sails.config.blueprints.clietRecordLimit || 10);

            //TODO: Check to see if we have pk
            var query = Model.find()
                .where(Resource.actionUtil.parseCriteria(req))
                .limit(Resource.actionUtil.parseLimit(req))
                .skip(Resource.actionUtil.parseSkip(req))
                .sort(Resource.actionUtil.parseSort(req));

            query = Resource.populateEach(query, req);

            query.exec(function found(err, matchingRecords){
                if(err) return res.negotiate(err);
                if(req._sails.hooks.pubsub && req.isSocket){
                    Model.subscribe(req, matchingRecords);
                    if(req.options.autoWatch) { Model.watch(req);}
                    (matchingRecords || []).map(function(record){
                        Resource.actionUtil.subscribeDeep(req, record);
                    });
                }

                res.ok({
                    status: 'OK',
                    title: 'List of records',
                    nicename: Resource.nicename,
                    records: matchingRecords,
                    criteria: Resource.actionUtil.parseCriteria(req),
                    metadata: getMetadata('findall')
                }, Resource.getViewPath('list'));
             });
         },
         /**
          * `BaseController.findall()`
          */
         new : function (req, res) {
             var Model = Resource.getModel();
             debug('Inside new..............');
             return res.ok({
                 form: {
                     action: '/' + Resource.nicename,
                     method: 'POST',
                     intent: 'create'
                 },
                 record: Model.getEmptyObject(req),
                 status: 'OK',
                 title: 'Add a new record',
                 metadata: getMetadata('new')
             }, Resource.getViewPath('new'));
         },
        showFind: function (req, res) {
            debug('Inside showFind..............');
            res.ok({
                title: 'Search records'
            }, Resource.getViewPath('find'));
        },
        //TODO: Does this belong here?!
        resetData: function (req, res) {
            DeviceService.preloadData(function(records) {
                return res.redirect( Resource.getViewPath());
            });
        },
        count: function(req, res){
            var Model = Resource.getModel();
            var criteria = Resource.actionUtil.parseCriteria(req);

            Model.count(criteria).then(function(total){
                res.ok({
                    count: total,
                    step: sails.config.blueprints.clietRecordLimit || 10
                });
            }).catch(function(err){
                res.sendError(500);
            });
        }
    };

    BaseController.Resource = Resource;

    return BaseController;
};
