'use strict';
/**
 * DeviceTypeController
 *
 * @description :: Server-side logic for managing devicetypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var BaseController = require('../../lib/BaseController')('DeviceType');
var debug = require('debug')('controller:DeviceType');
var extend = require('gextend');

var DeviceType = {};

module.exports = extend({}, BaseController, DeviceType);
