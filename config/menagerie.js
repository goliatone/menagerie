'use strict';

module.exports.menagerie = {
    /*
     * this will enable searching entities by a shortcode
     * derived from the entity UUID:
     * 895E3355 => 895E3355-92C3-41B6-BE87-6C96541E14FB
     *
     * Be aware that you could, potentially, have conflicts
     * and have multiple entities with the same shortcode.
     *
     * TODO: It could also we an int, specifiying min length
     *       of the code.
     */
    enableUUIDShortCodes: true,
    /*
     * We expose locals to the front-end via
     * express locals.
     */
    locals: {
        filters: {
            formatDate: function(date){
                return require('moment')(date).format('DD-MMM-YYYY');
            },
            deviceStateLabel: function(state){
                var classes = {
                    'unseen': 'warning', //not seen yet
                    'added': 'secondary', //checked in
                    'online': 'succes', //online health checkin
                    'offline': 'alert', //it was onli
                };
                return classes[state];
            }
        }
    }
};
