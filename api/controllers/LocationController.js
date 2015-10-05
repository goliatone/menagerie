'use strict';

/**
 * LocationController
 *
 * @description :: Server-side logic for managing locations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var BaseController = require('../../lib/BaseController')('Location');
var debug = require('debug')('controller:Location');
var extend = require('gextend');

var Controller = {};

module.exports = extend({}, BaseController, Controller);
