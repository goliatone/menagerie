'use strict';
/**
 * SiteController
 *
 * @description :: Server-side logic for managing sites
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var pkg = require('../../package.json');
module.exports = {
	homepage: function(req, res){
        res.ok({
            title: 'Menagerie'
        }, 'homepage');

    },
    dashboard: function(req, res){
        res.ok({
            title: 'Menagerie'
        }, 'dashboard');
    },
	health: function(req, res){
		res.ok({version: pkg.version});
	},
    _config:{}
};
