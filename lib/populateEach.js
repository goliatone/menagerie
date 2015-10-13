'use strict';

var _ = require('lodash');


module.exports = {
    /**
     * Mofidy Sails populateEach so that it supports
     * querying by relations:
     * ```
     * # POST /api/documents
     * {
     *     "where" : {
     *        // Normal conditions
     *      }
     *     "populate_user": {
     *         // Advanced condition for association 'admin'
     *         "where" : {
     *             "role" : {
     *                 "like": "%Admin%"
     *             }
     *         },
     *         "limit" : 4
     *       }
     *    }
     */
     populateEach: function ( query, req ) {
         var DEFAULT_POPULATE_LIMIT = sails.config.blueprints.defaultLimit || 30;
         var _options = req.options;
         var aliasFilter = req.param('populate');
         var shouldPopulate = _options.populate;

         // Convert the string representation of the filter list to an Array. We
         // need this to provide flexibility in the request param. This way both
         // list string representations are supported:
         //   /model?populate=alias1,alias2,alias3
         //   /model?populate=[alias1,alias2,alias3]
         if (typeof aliasFilter === 'string') {
             aliasFilter = aliasFilter.replace(/\[|\]/g, '');
             aliasFilter = (aliasFilter) ? aliasFilter.split(',') : [];
         }

         return _(_options.associations).reduce(function populateEachAssociation (query, association) {
             // If an alias filter was provided, override the blueprint config.
             if (aliasFilter) {
                 shouldPopulate = _.contains(aliasFilter, association.alias);
             }

             // Only populate associations if a population filter has been supplied
             // with the request or if `populate` is set within the blueprint config.
             // Population filters will override any value stored in the config.
             //
             // Additionally, allow an object to be specified, where the key is the
             // name of the association attribute, and value is true/false
             // (true to populate, false to not)
             if (shouldPopulate) {
                 // IMPORTANT NOTE: This is my trick. We should take advanced options from request parameter to make requests even more flexible
                 var populationOptions = req.param('populate_' + association.alias);

                 if (!populationOptions) {
                     var populationLimit = _options['populate_' + association.alias+'_limit'] ||
                                           _options.populate_limit ||
                                           _options.limit ||
                                           DEFAULT_POPULATE_LIMIT;
                     populationOptions = {limit: populationLimit};
                 }

                 return query.populate(association.alias, populationOptions);
             }
             else {
                 return query;
             }
         }, query);
     }
};
