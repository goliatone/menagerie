'use strict';
/**
 * DeviceTypeController
 *
 * @description :: Server-side logic for managing devicetypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Resource = require('../resources')('DeviceType');
var debug = require('debug')('controller:DeviceTypeController');

module.exports = {
     /**
      * `DeviceTypeController.create()`
      */
     create: function (req, res) {

         var Model = Resource.getModel();

        //  debug('Inside create..............req.params = ' + JSON.stringify(req.params.all()));

         var payload = Model.getParametersFromRequest(req);
         debug('Inside create..............req.params = ' + JSON.stringify(payload));

         return Model.create(payload).then(function (record) {
             debug('Resource created: ' + JSON.stringify(record));
             return res.redirect(Resource.baseView);
         }).catch(function (err) {
             console.error('Error on Resource.create');
             console.error(err);
             console.error(JSON.stringify(err));
             return res.ok({
                 record: payload,
                 status: 'Error',
                 statusDescription: err,
                 title: 'Add a new record'
             }, Resource.getViewPath('new'));
         });

     },
     /**
      * `DeviceTypeController.update()`
      */
     update: function (req, res) {
         var Model = Resource.getModel();
         var payload = Model.getParametersFromRequest(req);

         debug('Inside update..............req.params = ' + JSON.stringify(payload));

         return Model.update(payload).then(function (record) {
             debug('Resource created: ' + JSON.stringify(record));
            //  return res.redirect(Resource.baseView);
             return res.redirect(Resource.getViewPath());
         }).catch(function (err) {
             console.error('Error on Resource.update');
             console.error(err);

             return Model.findByIdFromRequest(req).then(function (record) {
                 if (record && record.length > 0) {
                     return res.ok({
                         record: record[0],
                         status: 'Error',
                         errorType: 'validation-error',
                         statusDescription: err,
                         title: 'Details'
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
      * `DeviceTypeController.delete()`
      */
     delete: function (req, res) {
         debug('Inside delete..............');
         var Model = Resource.getModel();
         return Model.findByIdFromRequest(req).then(function (record) {
             if (record && record.length > 0) {

                 record[0].destroy().then(function (record) {
                     debug('Deleted successfully!!! record = ' + record);
                     return res.redirect(Resource.getViewPath());
                 }).catch(function (err) {
                     console.error(err);
                     return res.redirect(Resource.getViewPath());
                 });
             } else {
                 return res.ok({message: 'Sorry, no resource found with id - ' + req.param('id')}, '500');
             }
         }).catch(function (err) {
             return res.ok({message: 'Sorry, no resource found with id - ' + req.param('id')}, '500');
         });


     },
     /**
      * `DeviceTypeController.find()`
      */
     find: function (req, res) {
         var Model = Resource.getModel();
         debug('Inside find..............');
         var id = req.params.id;
         debug('Inside find.............. id = ' + id);

         return Model.findByIdFromRequest(req)
         .populateAll()
		 .then(function (record) {

             if (record && record.length > 0) {
                 debug('Inside find Found .... record = ' + JSON.stringify(record));
                 return res.ok({
                     form:{
                         action: '/' + Resource.nicename,
                         method: 'PUT'
                     },
                     status: 'OK',
                     title: 'Details',
                     record: record[0]
                 }, Resource.getViewPath('edit'));
             } else {
                 debug('Inside find NOT Found .... ');
                 return res.ok({
                     status: 'Error',
                     errorType: 'not-found',
                     statusDescription: 'No record found with id, ' + id,
                     title: 'Details'
                 }, Resource.getViewPath('edit'));
             }
         }).catch(function (err) {
             debug('Inside find ERROR .... ');
             return res.ok({
                 status: 'Error',
                 errorType: 'not-found',
                 statusDescription: 'No record found with id, ' + id,
                 title: 'Details'
             }, Resource.getViewPath('edit'));
         });

     },
     /**
      * `DeviceTypeController.findall()`
      */
     findall: function (req, res) {
         var Model = Resource.getModel();
         debug('Inside findall..............');

         return Model.find().then(function (records) {
             debug('Resource.findAll -- records = ' + records);
             return res.ok({
                 status: 'OK',
                 title: 'List of records',
                 nicename: Resource.nicename,
                 records: records
             }, Resource.getViewPath('list'));
         }).catch(function (err) {
             console.error('Error on Resource.findAll');
             console.error(err);
             return res.ok({message: 'Sorry, an error occured - ' + err}, '500');
         });
     },
     /**
      * `DeviceTypeController.findall()`
      */
     new : function (req, res) {
         var Model = Resource.getModel();
         debug('Inside new..............');
         return res.ok({
             form: {
                 action: '/' + Resource.nicename,
                 method: 'POST'
             },
             record: {
                 name: '',
                 description: '',
                 label: '',
                 metadata: ''
             },
             status: 'OK',
             title: 'Add a new record'
         }, Resource.getViewPath('new'));
     },
     showFind: function (req, res) {
         debug('Inside showFind..............');
         res.ok({
             title: 'Search records'
         }, Resource.getViewPath('find'));
     },
     resetData: function (req, res) {
         Resource.preloadData(function(records) {
             return res.redirect(Resource.getViewPath());
         });
     }

 };
