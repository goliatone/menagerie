# menagerie
Manage things... all the things. WeeThings!

---

## Docker

Currently we are using three docker environments:
- Development 
- Staging
- Production

Each environment has a different set of environmental variables with different values for things like the `postgres` connection data or the google oauth client information.

The environment variables currently used:

* DEBUG
* NODE_ENV
* NODE_CLIENT_BASE_URL
* GOOGLE_CLIENT_ID
* GOOGLE_CLIENT_SECRET
* NODE_POSTGRES_USER
* NODE_POSTGRES_PSWD
* NODE_POSTGRES_DATABASE
* NODE_POSTGRES_ENDPOINT

You can build a `docker-compose.yml` file dynamically. You can use the bundled `expand` bash script to expand the tokens in the `docker-compose.tpl.yml` file. It will replace any of the tokens used in the template with an environmental variable with the same name.

```
$ ./expand -t docker-compose.tpl.yml
```

So, if the template has a ${MY_VAR} token and the current environment has a MY_VAR variable of "my_value", ${MY_VAR} will get replaced with "my_value".

You can use [envset][envset] to dynamically inject environmental variables into your shell before executing the `expand` script.

```
$ envset development ./expand -t docker-compose.tpl.yml
```

`envset` uses an `.envset` config file holding env vars definitions. You can check the [tpl.envset][tplenvset] for an example.

To install `envset`:

```
npm i -g envset
```


### Deployment

Select prod:

```
docker-compose -f docker-compose.prod.yml up -d
```

Development:
```
docker-compose up -d
```

After compose up, you can start a bash terminal into the container:
```
docker exec -ti menagerie_menagerie_1 /bin/bash
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


#### Docker

All build commands are in the `.travis.yml` file, but basically:

Build and tag image:
```
docker build -t goliatone/menagerie .
```

Then, we run tests:
```
docker run goliatone/menagerie  /bin/sh -c "cd /opt/menagerie; npm test"
```



NODE_POSTGRES_USER=menagerie NODE_POSTGRES_PSWD=menagerie NODE_POSTGRES_DATABASE=menagerie NODE_POSTGRES_ENDPOINT=menagerie-devel.c1vocxbad8zi.us-east-1.rds.amazonaws.com 


User.create({username:"goliat", email:"hello@goliatone.com"}).exec(console.log)


Passport.create({"protocol": "local","password": "$2a$10$eLP4Wh/apu0QMYwH5t0SX.wEcPG5r1WmSADZtZjJJYlQP.G4dwIzq","user": 1,"accessToken": "qVKUJ7/Os8eSCyjFf86j31rwbRavRBwM214GOJ+kcvQg4uSjq1WoZ5YNb71MsDit","createdAt": "2015-10-26T19:55:40.382Z","updatedAt": "2015-10-26T19:55:40.382Z","id": 1}).exec(console.log)



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

### Docker: Development

A) Get your docker's env IP:

```
docker-machine ip dev
```

B) Add an entry to your hosts table routing the previous IP to the `things.menagerie.dev` domain:
```
sudo nano /etc/hosts
```


```
##### LOCAL DEV
192.168.99.100     things.menagerie.dev
```


## Data 
There are two helper scripts to manage data:
- `export-tables-to-csv`
- `import-csvs-to-table`

It is recommend to use `envset` to manage credentials by injecting them into a shell's environment.

`export-tables-to-csv`:
From the **menagerie** project directory, export the tables from the **production** environment to CSV format. The command would be:

```
$ envset production ./data/postgres/bin/export-tables-to-csv -t device,location,devicetype --verbose
```

You list all tables to be exported with the `-t` flag. This will generate a CSV file per table inside the **data/postgres/data** directory.

`import-csvs-to-table`:

The following command would import data from each CSV file into a table with a matching name in the **development** environment:

```
envset development ./data/postgres/bin/import-csvs-to-table -t device,devicetype,location
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
    * Barcode
    * QR code

<!--
http://stackoverflow.com/questions/17929307/how-to-serve-a-bootstrap-template-in-sails-0-9
http://stackoverflow.com/questions/25988329/integrate-twitter-bootstrap-with-sails-js-v0-10
https://github.com/cgmartin/sailsjs-angularjs-bootstrap-example/tree/master/views

http://stackoverflow.com/questions/30671160/swagger-sails-js
-->

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


[1]: http://stackoverflow.com/questions/23446484/sails-js-populate-nested-associations
[2]: http://stackoverflow.com/questions/26535727/sails-js-waterline-populate-deep-nested-association
[3]: http://stackoverflow.com/questions/32594628/use-bluebird-to-deep-populate-objects-in-sailsjs
[4]: http://stackoverflow.com/questions/23995813/sails-beta-0-10-0-rc7-populate-a-b-c-association
[envset]: https://github.com/goliatone/envset
[travis-ci]: https://github.com/travis-ci/travis.rb
[instructions]: https://github.com/travis-ci/travis.rb#installation
[gtoken]: https://github.com/settings/tokens
[credentials]: https://console.developers.google.com/apis/credentials
[gdc]: https://console.developers.google.com
[eapi]: https://console.developers.google.com/apis/library
[tplenvset]: https://github.com/goliatone/envset/blob/master/example/tpl.envset
