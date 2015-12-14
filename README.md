# menagerie
Manage things... all the things. WeeThings!

---


## Development

### Grunt Tasks

There are several custom grunt tasks:
* db:manage:*
* menagerie:*

Under the hood both tasks load Sails configuration, so we can reuse the same _connection_ options without having to duplicate them in the _tasks/config_ directory.

This also means that we can use [envset][envset] to manage connection environmental variables:

To create a user in the development environment:
```
envset development -- grunt menagerie:user:create --username=test_user --email=test_user@menagerie.io
```

To create a token:
```
envset development -- grunt menagerie:token:create --userid=3
```


#### db:manage:*

`db:manage` handles common **postgres** operations like creating a database user, dropping a database, or executing a custom `sql` file. You can run any of the commands with the `--dry-run` to see the generated `sql` but without executing the query against the database.

The available commands are:
* db:manage:create-user: --roles, --user, --password, --superuser
* db:manage:create-db: --database, --owner, --encoding
* db:manage:assign-owner: --database, --owner
* db:manage:drop-db: --database
* db:manage:drop-user: --user
* db:manage:sql-file: --database, --host, --port, --user, --filename

You can get more information about the commands by running the task without a subcommand: `$ grunt db:manage`.

Example 
```
grunt db:manage:sql-file --connection.password=pepe --connection.name=something \
    --connection.host=things.menagerie.dev --connection.port=5432 --connection.user=menagerie \
    --filename=migration_file.sql
```


#### menagerie:*

`menagerie:*` provides the following tasks:

* `menagerie:user:create`: --username, --email
* `menagerie:user:update`: --id, all other attributes as options behind double dashes.
* `menagerie:user:delete`: --id

* `menagerie:token:create`: --userid
* `menagerie:token:update`: --id
* `menagerie:token:delete`: --token

* `menagerie:location:create`: --uuid (optional), --name, --description
* `menagerie:location:update`: --id, all other attributes as options behind double dashes.
* `menagerie:location:delete`: --id


This also means that we can use [envset][envset] to manage connection environmental variables, so we can:

Create a user in the development environment:
```
envset development -- grunt menagerie:user:create --username=test_user --email=test_user@menagerie.io
```

Create a new oauth token for a given user:
```
envset development -- grunt menagerie:token:create --userid=3
```


### Data Import/Export

#### Services

There are two services, `LocationService` and `DeviceService` that dump a JSON file from data on the database and also populate a database from a JSON file.

It's intended as a way to export/import data using Sails's ORM.

You can access the services from the Sails `repl` interface:

Access the in with credentials for the staging environment:
```
envset staging -- sails c
```

Once in the `repl`:

```
sails> LocationService.generateSeedFromData('./location_sed.json')
```

This will generate a json file in the project directory.

To import, you need to place the generated file in the **data/seed/json/** directory and ran the following command from terminal:

```
sails> LocationService.preloadFromJSONExport()
```


There are also two scripts available under **data/postgres/bin** to manage data import and export. This will be eventually ported to grunt. 

The two helper scripts are:

- `export-tables-to-csv`
- `import-csvs-to-table`

It is recommend to use [envset][envset] to manage credentials by injecting them into a shell's environment.

#### export-tables-to-csv
Use this scrip to export data from one environment in `CSV` format.

From the **menagerie** project directory, export the tables from the **production** environment to CSV format. The command would be:

```
$ envset production ./data/postgres/bin/export-tables-to-csv -t device,location,devicetype --verbose
```

You list all tables to be exported with the `-t` flag. This will generate a CSV file per table inside the **data/postgres/data** directory.

#### import-csvs-to-table

The following command would import data from each CSV file into a table with a matching name in the **development** environment:

```
envset development ./data/postgres/bin/import-csvs-to-table -t device,devicetype,location
```

To load data in the local development environment:
```
envset local ./data/postgres/bin/import-csvs-to-table -t device,devicetype,location
```


### Docker

We use docker and docker-machine. The basic work-flow is a build and up cycle.
Ensure that your desired docker machine is up and running. 

```
docker-machine start dev
```


Build image:
```
docker-compose build
```

Development:
```
docker-compose up -d
```

If the container is not showing the changes you expect to see, you might have to re-build the image:

```
docker-compose build --no-cache
```

When your container is running, you can start a bash terminal into the container:
```
docker exec -ti menagerie_menagerie_1 /bin/bash
```

#### docker-compose

There is a `docker-compose` template from which you can build a `docker-compose.yml` file dynamically. 

You can use the [slv][slv] utility to expand the tokens in the `docker-compose.tpl.yml` template file, `slv`  will replace any tokens used in the template with an environmental variable with the same name.

You can use [envset][envset] to dynamically inject environmental variables into your shell, and [slv][slv] will pick those up.

This will print the rendered template to terminal:

```
$ envset development -- slv docker-compose.tpl.yml
```

To store the template:

```
$ envset development -- slv docker-compose.tpl.yml > docker-compose.yml
```


`envset` uses an `.envset` configuration file holding environmental variables per environment. You can check the [tpl.envset][tplenvset] for an example.

A simple way to share `.envset` files between team members is [vcn][vcn], it uses amazon's `S3` to share encrypted files.

Store an `.envset` file:

```
vcn put -b <bucket_name> --password <password> --id envset --filepath .envset
```


Retrieve `.envset` file:
```
vcn get -b <bucket_name> --password <password> --id envset --filepath .envset
```


To install `envset`, `slv`, and `vcn`:

```
npm i -g envset slv vcn 
```



## Environment Variables

Currently we are using three docker environments:
- Development 
- Staging
- Production

Each environment has a different set of environmental variables for things like the `postgres` connection data or the google oauth client information.

The environment variables currently used:

* NODE_ENV: Environment name; 'local', 'development', 'staging', 'production'.
* NODE_DEBUG: '*', false, or a specific `debug` level
* NODE_CLIENT_BASE_URL: Used to build OAuth links.
* GOOGLE_CLIENT_ID
* GOOGLE_CLIENT_SECRET
* NODE_POSTGRES_USER
* NODE_POSTGRES_PSWD
* NODE_POSTGRES_DATABASE
* NODE_POSTGRES_ENDPOINT


## Google OAuth
To use Google OAuth, you need to create and configure a project in the google development environment.

Go to the [google developer console][gdc], and create a new project.

Configure OAuth consent screen- configure Domain Verification if needed.

Create client [ID credentials][credentials]. Select OAuth 2.0 client IDs option. I created three clients, one for each `docker` environment:

- Web Local
- Web Staging
- Web Production

For each environment, we need to create the following environment variables:
- GOOGLE_CLIENT_ID:Credentials screen.
- GOOGLE_CLIENT_SECRET: Credentials screen.
- NODE_CLIENT_BASE_URL

The first two you get from the Credentials screen, by clicking on the specific client.

The third is the base URL the oauth callbacks should redirect to. IPs are not valid callbacks, `localhost` is a valid domain. 

Your local development docker environment will not work with oauth since you access the container through an IP address. You can create an entry on the `hosts` file in your Mac computer.

Enable APIs, [here][eapi]

### Gooble OAuth callback on Docker Container

To run OAuth callbacks inside the container we will configure a `hosts` entry in order to get a local domain as OAuth will not take IPs.

Get your docker's env IP, here I'm using a docker machine called **dev**:

```
$ docker-machine ip dev
192.168.99.100
```


Add an entry to your hosts table routing the previous IP to the `things.menagerie.dev` domain:

```
sudo nano /etc/hosts
```


Add the local domain.
```
##### LOCAL DEV
192.168.99.100     things.menagerie.dev
```


## Build process

#### Travis CI

If you don't have the `travis` CLI [client][travis-ci] installed, then follow the [instructions][instructions].

Also, you might want to configure the client with a [github token][gtoken], it will make working with the client easier.

In order to push `docker` images to `docker hub` you have to setup environmental variables for `travis`:

```
travis env set DOCKER_EMAIL me@example.com
travis env set DOCKER_USERNAME myusername
travis env set DOCKER_PASSWORD secretsecret
```


#### Build Docker Images

All build commands are in the `.travis.yml` file, but basically:

Build and tag image:
```
docker build -t goliatone/menagerie .
```

Then, we run tests:
```
docker run goliatone/menagerie  /bin/sh -c "cd /opt/menagerie; npm test"
```


### TODO:
* Replace `autoPK`, use UUID as main id instead.
* Add model validations
* ~~CSV import~~
* ~~CSV export~~
* ~~Job to handle CSV import~~
* Extarnalize CSV import job
* Table for quick search: id, uuid, alias, className
* Invite to register user, token table/validation
* Print QR codes
* ~~Add support for multiple identifiers:~~
    * ~~Barcode~~
    * ~~QR code~~
* Add route per model to show schema (build forms)

<!--
http://stackoverflow.com/questions/17929307/how-to-serve-a-bootstrap-template-in-sails-0-9
http://stackoverflow.com/questions/25988329/integrate-twitter-bootstrap-with-sails-js-v0-10
https://github.com/cgmartin/sailsjs-angularjs-bootstrap-example/tree/master/views

http://stackoverflow.com/questions/30671160/swagger-sails-js
-->

<!-- 
### Development

```js
var pojo = {name:'Sockete 3', description: 'Sockete instance', status:'offline', type:1, location:1}
io.socket.post('/device', pojo, function(data, jwres){
    console.log(arguments)
});
```

```js
io.socket.get('/device/1', function(data, jwres){
    console.log(arguments)
});
```

### Data Models

Device
* Alias
Device needs to support multiple IDs, say a chip identifier and the given UUID.

www.menagerie.io/ESP8266/91243/

Location
* Floor plan
* Sublocation


Device Type
* Product Information
    * Image
    * Vendor
    * URL


Populate nested [relationships][1] and [more][2] and here with [locations][3], and [menu][4]

```sql
CREATE TABLE "category"
  (
     "id"          SERIAL       PRIMARY KEY,
     "parent"      INTEGER      NULL DEFAULT NULL REFERENCES "category" ("id")
     "name"        VARCHAR(50)  NOT NULL UNIQUE,
     "description" VARCHAR(100) NOT NULL,
     "sort_order"  INTEGER      NULL DEFAULT NULL,
  );
```
-->


[1]: http://stackoverflow.com/questions/23446484/sails-js-populate-nested-associations
[2]: http://stackoverflow.com/questions/26535727/sails-js-waterline-populate-deep-nested-association
[3]: http://stackoverflow.com/questions/32594628/use-bluebird-to-deep-populate-objects-in-sailsjs
[4]: http://stackoverflow.com/questions/23995813/sails-beta-0-10-0-rc7-populate-a-b-c-association
[envset]: https://github.com/goliatone/envset
[slv]: https://github.com/goliatone/slv
[travis-ci]: https://github.com/travis-ci/travis.rb
[instructions]: https://github.com/travis-ci/travis.rb#installation
[gtoken]: https://github.com/settings/tokens
[credentials]: https://console.developers.google.com/apis/credentials
[gdc]: https://console.developers.google.com
[eapi]: https://console.developers.google.com/apis/library
[tplenvset]: https://github.com/goliatone/envset/blob/master/example/tpl.envset
[vcn]: https://github.com/goliatone/vcn


TODO: 
* Create Images if not present (review BarcodeController and BarcodeService)



<!--
https://www.digitalocean.com/community/tutorials/how-to-use-roles-and-manage-grant-permissions-in-postgresql-on-a-vps--2
-->
