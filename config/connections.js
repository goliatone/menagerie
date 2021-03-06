/**
 * Connections
 * (sails.config.connections)
 *
 * `Connections` are like "saved settings" for your adapters.  What's the difference between
 * a connection and an adapter, you might ask?  An adapter (e.g. `sails-mysql`) is generic--
 * it needs some additional information to work (e.g. your database host, password, user, etc.)
 * A `connection` is that additional information.
 *
 * Each model must have a `connection` property (a string) which is references the name of one
 * of these connections.  If it doesn't, the default `connection` configured in `config/models.js`
 * will be applied.  Of course, a connection can (and usually is) shared by multiple models.
 * .
 * Note: If you're using version control, you should put your passwords/api keys
 * in `config/local.js`, environment variables, or use another strategy.
 * (this is to prevent you inadvertently sensitive credentials up to your repository.)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.connections.html
 */

module.exports.connections = {

  /***************************************************************************
  *                                                                          *
  * Local disk storage for DEVELOPMENT ONLY                                  *
  *                                                                          *
  * Installed by default.                                                    *
  *                                                                          *
  ***************************************************************************/
  localDiskDb: {
    adapter: 'sails-disk'
  },

  /***************************************************************************
  *                                                                          *
  * MongoDB is the leading NoSQL database.                                   *
  * http://en.wikipedia.org/wiki/MongoDB                                     *
  *                                                                          *
  * Run: npm install sails-mongo                                             *
  *                                                                          *
  ***************************************************************************/
  mongodb: {
    adapter: 'sails-mongo',
    host: process.env.NODE_MONGO_ENDPOINT,
    port: process.env.NODE_MONGO_PORT || 27017,
    user: process.env.NODE_MONGO_USERNAME, //optional
    password: process.env.NODE_MONGO_PASSWORD, //optional
    database: process.env.NODE_MONGO_DATABASE || 'menagerie' //optional
  },
  /***************************************************************************
  *                                                                          *
  * PostgreSQL is another officially supported relational database.          *
  * http://en.wikipedia.org/wiki/PostgreSQL                                  *
  *                                                                          *
  * Run: npm install sails-postgresql                                        *
  *                                                                          *
  *                                                                          *
  ***************************************************************************/

  // 'developmentPostgres': {
  //   adapter: 'sails-postgresql',
  //   host: process.env.POSTGRES_PORT_5432_TCP_ADDR || '192.168.99.100',
  //   user: 'postgres',
  //   password: '',
  //   database: 'postgres'
  // },

  'remotePostgres': {
    adapter: 'sails-postgresql',
    host: process.env.NODE_POSTGRES_ENDPOINT,
    user: process.env.NODE_POSTGRES_USER,
    password: process.env.NODE_POSTGRES_PSWD,
    database: process.env.NODE_POSTGRES_DATABASE
  }
};
