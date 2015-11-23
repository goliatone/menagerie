

exports.config = {
    /**
     * Array of application names.
     */
    app_name: ['Menagerie'],
    /**
     * Your New Relic license key.
     */
    license_key: process.env.NODE_NEWRELIC_KEY,
    logging: {
        /**
         * Level at which to log. 'trace' is most useful 
         * to New Relic when diagnosing issues with the agent, 
         * 'info' and higher will impose the least overhead on
         * production applications.
         */
        level: 'warn',
        rules: {
            ignore: ['^/socket.io/*/xhr-polling']
        }
    }
};