/**
 * ConfigurationController
 *
 * @description :: Server-side logic for managing configurations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var BaseController = require('../../lib/BaseController')('Configuration');
 var debug = require('debug')('controller:Configuration');
 var extend = require('gextend');

 var Controller = {};

 module.exports = extend({}, BaseController, Controller);
