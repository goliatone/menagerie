'use strict';

/**
 * LocationController
 *
 * @description :: Server-side logic for managing locations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var uuid = require('random-uuid-v4');
 module.exports = {
    /**
     * `LocationController.create()`
     */
    create: function (req, res) {
        console.log('Inside create..............req.params = ' + JSON.stringify(req.params.all()));

        var _record = {
            uuid: req.param('uuid'),
            name: req.param('name'),
            description: req.param('description'),
            geolocation: req.param('geolocation'),
            devices: req.param('devices')
        };

        return Location.create(_record).then(function (_record) {
            console.log('Location created: ' + JSON.stringify(_record));
            return res.redirect('location');
        }).catch(function (err) {
            console.error('Error on LocationService.createLocation');
            console.error(err);
            console.error(JSON.stringify(err));
            return res.view('location/new', {
                record: _record,
                status: 'Error',
                statusDescription: err,
                title: 'Add a new record'
            });
        });

    },
    /**
     * `LocationController.update()`
     */
    update: function (req, res) {
        console.log('Inside update..............');

        return Location.update({
            uuid: req.param('uuid'),
            name: req.param('name'),
            description: req.param('description'),
            geolocation: req.param('geolocation'),
            devices: req.param(devices)
        }).then(function (_record) {
            return res.redirect('location');
        }).catch(function (err) {
            console.error('Error on LocationService.updateLocation');
            console.error(err);

            return Location.find().where({uuid: req.param('uuid')}).then(function (_record) {
                if (_record && _record.length > 0) {
                    return res.view('location/edit', {
                        record: _record[0],
                        status: 'Error',
                        errorType: 'validation-error',
                        statusDescription: err,
                        title: 'Location Details'
                    });
                } else {
                    return res.view('500', {message: 'Sorry, no Location found with uuid - ' + req.param('uuid')});
                }
            }).catch(function (err) {
                return res.view('500', {message: 'Sorry, no Location found with uuid - ' + req.param('uuid')});
            });
        });

    },
    /**
     * `LocationController.delete()`
     */
    delete: function (req, res) {
        console.log('Inside delete..............');

        return Location.find().where({uuid: req.param('uuid')}).then(function (_record) {
            if (_record && _record.length > 0) {

                _record[0].destroy().then(function (_record) {
                    console.log('Deleted successfully!!! _record = ' + _record);
                    return res.redirect('location');
                }).catch(function (err) {
                    console.error(err);
                    return res.redirect('location');
                });
            } else {
                return res.view('500', {message: 'Sorry, no Location found with uuid - ' + req.param('uuid')});
            }
        }).catch(function (err) {
            return res.view('500', {message: 'Sorry, no Location found with uuid - ' + req.param('uuid')});
        });


    },
    /**
     * `LocationController.find()`
     */
    find: function (req, res) {
        console.log('Inside find..............');
        var _uuid = req.params.id;
        console.log('Inside find.............. _uuid = ' + _uuid);

        return Location.find().where({id: _uuid}).then(function (_record) {

            if (_record && _record.length > 0) {
                console.log('Inside find Found .... _record = ' + JSON.stringify(_record));
                return res.view('location/edit', {
                    form:{
                        action: '/location',
                        method: 'PUT'
                    },
                    status: 'OK',
                    title: 'Location Details',
                    record: _record[0]
                });
            } else {
                console.log('Inside find NOT Found .... ');
                return res.view('location/edit', {
                    status: 'Error',
                    errorType: 'not-found',
                    statusDescription: 'No record found with uuid, ' + _uuid,
                    title: 'Location Details'
                });
            }
        }).catch(function (err) {
            console.log('Inside find ERROR .... ');
            return res.view('location/edit', {
                status: 'Error',
                errorType: 'not-found',
                statusDescription: 'No record found with uuid, ' + _uuid,
                title: 'Location Details'
            });
        });

    },
    /**
     * `LocationController.findall()`
     */
    findall: function (req, res) {
        console.log('Inside findall..............');

        return Location.find().then(function (records) {
            console.log('LocationService.findAll -- records = ' + records);
            return res.view('location/list', {
                status: 'OK',
                title: 'List of records',
                nicename: 'location',
                records: records
            });
        }).catch(function (err) {
            console.error('Error on LocationService.findAll');
            console.error(err);
            return res.view('500', {message: 'Sorry, an error occurd - ' + err});
        });
    },
    /**
     * `LocationController.findall()`
     */
    new : function (req, res) {
        console.log('Inside new..............');
        return res.view('location/new', {
            form: {
                action: '/location',
                method: 'POST'
            },
            record: {
                uuid: uuid().toUpperCase(),
                name: '',
                description: '',
                geolocation: '',
                devices: ''
            },
            status: 'OK',
            title: 'Add a new record'
        });
    },
    showFind: function (req, res) {
        console.log('Inside showFind..............');
        res.view('location/find', {
            title: 'Search records'
        });
    },
    resetData: function (req, res) {
        LocationService.preloadData(function(_records) {
            return res.redirect('location');
        });
    }

};
