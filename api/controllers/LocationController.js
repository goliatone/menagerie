'use strict';

/**
 * LocationController
 *
 * @description :: Server-side logic for managing locations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var uuid = require('random-uuid-v4');

function _uppercase(str){
    return str.charAt(0).toUpperCase() + str.slice(1, str.length);
}

function BaseController(name){
    this.nicename = name;
    this.baseView = this.nicename;
    this.label = _uppercase(name);
}
BaseController.prototype.getViewPath = function(action){
    return action ? this.baseView + '/' + action : this.baseView;
};

var Resource = new BaseController('location');

module.exports = {
    /**
     * `LocationController.create()`
     */
    create: function (req, res) {

        var Model = Location;

        console.log('Inside create..............req.params = ' + JSON.stringify(req.params.all()));

        var _record = {
            uuid: req.param('uuid'),
            name: req.param('name'),
            description: req.param('description'),
            geolocation: req.param('geolocation'),
            devices: req.param('devices')
        };

        return Model.create(_record).then(function (_record) {
            console.log('Location created: ' + JSON.stringify(_record));
            return res.redirect(Resource.baseView);
        }).catch(function (err) {
            console.error('Error on LocationService.createLocation');
            console.error(err);
            console.error(JSON.stringify(err));
            return res.view(Resource.getViewPath('new'), {
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
        var Model = Location;

        return Model.update({
            id: req.param('id'),
            uuid: req.param('uuid'),
            name: req.param('name'),
            description: req.param('description'),
            geolocation: req.param('geolocation'),
            devices: req.param('devices')
        }).then(function (_record) {
            return res.redirect(Resource.getViewPath());
        }).catch(function (err) {
            console.error('Error on LocationService.updateLocation');
            console.error(err);

            return Model.find().where({uuid: req.param('uuid')}).then(function (_record) {
                if (_record && _record.length > 0) {
                    return res.view(Resource.getViewPath('edit'), {
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
        var Model = Location;
        return Model.find().where({id: req.param('id')}).then(function (_record) {
            if (_record && _record.length > 0) {

                _record[0].destroy().then(function (_record) {
                    console.log('Deleted successfully!!! _record = ' + _record);
                    return res.redirect(Resource.getViewPath());
                }).catch(function (err) {
                    console.error(err);
                    return res.redirect(Resource.getViewPath());
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
        var Model = Location;
        console.log('Inside find..............');
        var _uuid = req.params.id;
        console.log('Inside find.............. _uuid = ' + _uuid);

        return Model.find().where({id: _uuid}).then(function (_record) {

            if (_record && _record.length > 0) {
                console.log('Inside find Found .... _record = ' + JSON.stringify(_record));
                return res.view(Resource.getViewPath('edit'), {
                    form:{
                        action: '/' + Resource.nicename,
                        method: 'PUT'
                    },
                    status: 'OK',
                    title: 'Location Details',
                    record: _record[0]
                });
            } else {
                console.log('Inside find NOT Found .... ');
                return res.view(Resource.getViewPath('edit'), {
                    status: 'Error',
                    errorType: 'not-found',
                    statusDescription: 'No record found with uuid, ' + _uuid,
                    title: 'Location Details'
                });
            }
        }).catch(function (err) {
            console.log('Inside find ERROR .... ');
            return res.view(Resource.getViewPath('edit'), {
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
        var Model = Location;
        console.log('Inside findall..............');

        return Model.find().then(function (records) {
            console.log('LocationService.findAll -- records = ' + records);
            return res.view(Resource.getViewPath('list'), {
                status: 'OK',
                title: 'List of records',
                nicename: Resource.nicename,
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
        var Model = Location;
        console.log('Inside new..............');
        return res.view(Resource.getViewPath('new'), {
            form: {
                action: '/' + Resource.nicename,
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
        res.view(Resource.getViewPath('find'), {
            title: 'Search records'
        });
    },
    resetData: function (req, res) {
        LocationService.preloadData(function(_records) {
            return res.redirect(Resource.getViewPath());
        });
    }

};
