/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'dashboard'
},

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

    'GET /location': 'LocationController.findall',
    'GET /location/new': 'LocationController.new',
    'GET /location/find': 'LocationController.showFind',
    'GET /location/reset': 'LocationController.resetData',
    'GET /location/:id': 'LocationController.find',
    'POST /location': 'LocationController.create',
    'PUT /location': 'LocationController.update',
    'DELETE /location': 'LocationController.delete',

    'GET /device': 'DeviceController.findall',
    'GET /device/new': 'DeviceController.new',
    'GET /device/find': 'DeviceController.showFind',
    'GET /device/reset': 'DeviceController.resetData',
    'GET /device/:id': 'DeviceController.find',
    'POST /device': 'DeviceController.create',
    'PUT /device': 'DeviceController.update',
    'DELETE /device': 'DeviceController.delete',
    'GET /device/manage': 'DeviceController.manage',

    'GET /devicetype': 'DeviceTypeController.findall',
    'GET /devicetype/new': 'DeviceTypeController.new',
    'GET /devicetype/find': 'DeviceTypeController.showFind',
    'GET /devicetype/reset': 'DeviceTypeController.resetData',
    'GET /devicetype/:id': 'DeviceTypeController.find',
    'POST /devicetype': 'DeviceTypeController.create',
    'PUT /devicetype': 'DeviceTypeController.update',
    'DELETE /devicetype': 'DeviceTypeController.delete',
};
