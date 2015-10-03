'use strict';
/**
 * DeviceController
 *
 * @description :: Server-side logic for managing devices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var uuid = require('random-uuid-v4');
 module.exports = {
     manage: function(req, res){
         return Device.update({id: req.param('deviceId')},{
             location: req.param('locationId')
         }).then(function (_record) {
             return res.redirect('device');
         }).catch(function (err) {
             console.error('Error on DeviceService.updateDevice');
             console.error(err);

             return Device.find().where({id: req.param('deviceId')}).then(function (_record) {
                 if (_record && _record.length > 0) {
                     return res.view('device/edit', {
                         record: _record[0],
                         status: 'Error',
                         errorType: 'validation-error',
                         statusDescription: err,
                         title: 'Device Details'
                     });
                 } else {
                     return res.view('500', {message: 'Sorry, no Device found with uuid - ' + req.param('uuid')});
                 }
             }).catch(function (err) {
                 return res.view('500', {message: 'Sorry, no Device found with uuid - ' + req.param('uuid')});
             });
         });
     },
     /**
      * `DeviceController.create()`
      */
     create: function (req, res) {
         console.log('Inside create..............req.params = ' + JSON.stringify(req.params.all()));

         var _record = {
             uuid: req.param('uuid'),
             name: req.param('name'),
             description: req.param('description'),
             type: req.param('type'),
             location: req.param('location')
         };

         return Device.create(_record).then(function (_record) {
             console.log('Device created: ' + JSON.stringify(_record));
             return res.redirect('device');
         }).catch(function (err) {
             console.error('Error on DeviceService.createDevice');
             console.error(err);
             console.error(JSON.stringify(err));
             return res.view('device/new', {
                 record: _record,
                 status: 'Error',
                 statusDescription: err,
                 title: 'Add a new record'
             });
         });

     },
     /**
      * `DeviceController.update()`
      */
      update: function (req, res) {
          console.log('Inside update..............');

          return Device.update({
              id: req.param('id'),
              uuid: req.param('uuid'),
              name: req.param('name'),
              description: req.param('description'),
              type: req.param('type'),
              location: req.param('location')
          }).then(function (_record) {
              return res.redirect('device');
          }).catch(function (err) {
              console.error('Error on DeviceService.updateDevice');
              console.error(err);

              return Device.find().where({id: req.param('id')}).then(function (_record) {
                  if (_record && _record.length > 0) {
                      return res.view('device/edit', {
                          record: _record[0],
                          status: 'Error',
                          errorType: 'validation-error',
                          statusDescription: err,
                          title: 'Device Details'
                      });
                  } else {
                      return res.view('500', {message: 'Sorry, no Device found with uuid - ' + req.param('uuid')});
                  }
              }).catch(function (err) {
                  return res.view('500', {message: 'Sorry, no Device found with uuid - ' + req.param('uuid')});
              });
          });

      },
      /**
       * `DeviceController.delete()`
       */
       delete: function (req, res) {
           console.log('Inside delete..............');

        return Device.find().where({id: req.param('id')}).then(function (_record) {
            if (_record && _record.length > 0) {

                _record[0].destroy().then(function (_record) {
                    console.log('Deleted successfully!!! _record = ' + _record);
                    return res.redirect('device');
                }).catch(function (err) {
                    console.error(err);
                    return res.redirect('device');
                });
            } else {
                return res.view('500', {message: 'Sorry, no Device found with uuid - ' + req.param('uuid')});
            }
        }).catch(function (err) {
            return res.view('500', {message: 'Sorry, no Device found with uuid - ' + req.param('uuid')});
        });


    },
    /**
     * `DeviceController.find()`
     */
    find: function (req, res) {
        console.log('Inside find..............');
        var id = req.params.id;
        console.log('Inside find.............. id = ' + id);

        return Device.find().where({id: id}).then(function (_record) {

            if (_record && _record.length > 0) {
                console.log('Inside find Found .... _record = ' + JSON.stringify(_record));
                return res.view('device/edit', {
                    form:{
                        action: '/device',
                        method: 'PUT'
                    },
                    status: 'OK',
                    title: 'Device Details',
                    record: _record[0]
                });
            } else {
                console.log('Inside find NOT Found .... ');
                return res.view('device/edit', {
                    status: 'Error',
                    errorType: 'not-found',
                    statusDescription: 'No record found with uuid, ' + id,
                    title: 'Device Details'
                });
            }
        }).catch(function (err) {
            console.log('Inside find ERROR .... ');
            return res.view('device/edit', {
                status: 'Error',
                errorType: 'not-found',
                statusDescription: 'No record found with uuid, ' + id,
                title: 'Device Details'
            });
        });

    },
    /**
     * `DeviceController.findall()`
     */
    findall: function (req, res) {
        console.log('Inside findall..............');

        return Device.find().then(function (records) {
            console.log('DeviceService.findAll -- records = ' + records);
            return res.view('device/list', {
                status: 'OK',
                title: 'List of records',
                nicename: 'device',
                records: records
            });
        }).catch(function (err) {
            console.error('Error on DeviceService.findAll');
            console.error(err);
            return res.view('500', {message: 'Sorry, an error occurd - ' + err});
        });
    },
    /**
     * `DeviceController.findall()`
     */
    new : function (req, res) {
        console.log('Inside new..............');
        return res.view('device/new', {
            form: {
                action: '/device',
                method: 'POST'
            },
            record: {
                uuid: uuid().toUpperCase(),
                name: '',
                description: '',
                type: '',
                devices: ''
            },
            status: 'OK',
            title: 'Add a new record'
        });
    },
    showFind: function (req, res) {
        console.log('Inside showFind..............');
        res.view('device/find', {
            title: 'Search records'
        });
    },
    resetData: function (req, res) {
        DeviceService.preloadData(function(_records) {
            return res.redirect('device');
        });
    }

};
