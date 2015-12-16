
var isDev = process.env.NODE_ENV === 'development',
    connectionId = isDev ? 'developmentPostgres' : 'remotePostgres';

connectionId = 'remotePostgres';

module.exports.migrations = {
  // Matches connection from config/connections.js
  connection: connectionId
};
