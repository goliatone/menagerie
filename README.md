# menagerie
Manage things... all the things. WeeThings!

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


### Deployment

Select prod:

```
docker-compose -f docker-compose.prod.yml up -d
```

Development:
```
docker-compose up -d
```


[1]: http://stackoverflow.com/questions/23446484/sails-js-populate-nested-associations
[2]: http://stackoverflow.com/questions/26535727/sails-js-waterline-populate-deep-nested-association
[3]: http://stackoverflow.com/questions/32594628/use-bluebird-to-deep-populate-objects-in-sailsjs
[4]: http://stackoverflow.com/questions/23995813/sails-beta-0-10-0-rc7-populate-a-b-c-association


## Build process

#### Travis CI

If you don't have the `travis` CLI [client][1] installed, then follow the [instructions][2].

Also, you might want to configure the client with a [github token][3], it will make working with the client easier.

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

[1]: https://github.com/travis-ci/travis.rb
[2]: https://github.com/travis-ci/travis.rb#installation
[3]: https://github.com/settings/tokens
