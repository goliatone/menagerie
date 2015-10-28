'use strict';
/**
 * SiteController
 *
 * @description :: Server-side logic for managing sites
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	homepage: function(req, res){
        res.ok('homepage', {
            title: 'Menagerie'
        });
    },
    dashboard: function(req, res){
        res.ok('dashboard', {
            title: 'Menagerie'
        });
    },
    _config:{}
};

