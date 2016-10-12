[local]
NODE_DEBUG=menagerie

NODE_GOOGLE_CLIENT_ID={{NODE_GOOGLE_CLIENT_ID}}
NODE_GOOGLE_CLIENT_SECRET={{NODE_GOOGLE_CLIENT_SECRET}}

NODE_CLIENT_BASE_URL=http://localhost:1337

[development]
NODE_DEBUG=menagerie

;## Used for Google oAuth plugin
NODE_GOOGLE_CLIENT_ID={{NODE_GOOGLE_CLIENT_ID}}
NODE_GOOGLE_CLIENT_SECRET={{NODE_GOOGLE_CLIENT_SECRET}}

;## Used for oAuth callback
NODE_CLIENT_BASE_URL=http://things.menagerie.dev/

;## MongoDB config
NODE_MONGO_PORT={{NODE_MONGO_PORT}}
NODE_MONGO_ENDPOINT={{NODE_MONGO_ENDPOINT}}
NODE_MONGO_DATABASE={{NODE_MONGO_DATABASE}}

[staging]
NODE_DEBUG=menagerie

;## Used for Google oAuth plugin
NODE_GOOGLE_CLIENT_ID={{NODE_GOOGLE_CLIENT_ID}}
NODE_GOOGLE_CLIENT_SECRET={{NODE_GOOGLE_CLIENT_SECRET}}

;## Used for oAuth callback
NODE_CLIENT_BASE_URL={{NODE_CLIENT_BASE_URL}}

;## MongoDB config
NODE_MONGO_PORT={{NODE_MONGO_PORT}}
NODE_MONGO_ENDPOINT={{NODE_MONGO_ENDPOINT}}
NODE_MONGO_USERNAME={{NODE_MONGO_USERNAME}}
NODE_MONGO_PASSWORD={{NODE_MONGO_PASSWORD}}
NODE_MONGO_DATABASE={{NODE_MONGO_DATABASE}}

;## Optional, if present we use winston-honeybadger
NODE_HONEYBADGER_KEY={{NODE_HONEYBADGER_KEY}}

;## Optional, if present we use winston-cloudwatch
NODE_AWS_ACCESS_KEY_ID={{NODE_AWS_ACCESS_KEY_ID}}
NODE_AWS_SECRET_ACCESS_KEY={{NODE_AWS_SECRET_ACCESS_KEY}}

[production]
NODE_DEBUG=

;## Used for Google oAuth plugin
NODE_GOOGLE_CLIENT_ID={{NODE_GOOGLE_CLIENT_ID}}
NODE_GOOGLE_CLIENT_SECRET={{NODE_GOOGLE_CLIENT_SECRET}}

;## Used for oAuth callback
NODE_CLIENT_BASE_URL={{NODE_CLIENT_BASE_URL}}

;## MongoDB config
NODE_MONGO_PORT={{NODE_MONGO_PORT}}
NODE_MONGO_ENDPOINT={{NODE_MONGO_ENDPOINT}}
NODE_MONGO_USERNAME={{NODE_MONGO_USERNAME}}
NODE_MONGO_PASSWORD={{NODE_MONGO_PASSWORD}}
NODE_MONGO_DATABASE={{NODE_MONGO_DATABASE}}

;## Optional, if present we use a newrelic hook
NODE_NEWRELIC_KEY={{NODE_NEWRELIC_KEY}}

;## Optional, if present we use winston-honeybadger
NODE_HONEYBADGER_KEY={{NODE_HONEYBADGER_KEY}}

;## Optional, if present we use winston-cloudwatch
NODE_AWS_ACCESS_KEY_ID={{NODE_AWS_ACCESS_KEY_ID}}
NODE_AWS_SECRET_ACCESS_KEY={{NODE_AWS_SECRET_ACCESS_KEY}}