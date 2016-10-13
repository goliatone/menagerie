# Menagerie

Menagerie is a prototype of a Device Management System for IoT devices.

With Menagerie you keep an inventory of your (hardware) devices, as well as help you in keeping track of their location and status over time as well as having a centralized repository for their configurations.

It can be used with it's companion iOs [scanner application][ios-app] to simplify
## Table Of Contents
<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Menagerie](#menagerie)
	- [Table Of Contents](#table-of-contents)
- [Development](#development)
	- [Installation](#installation)
		- [Getting started](#getting-started)
			- [Downloading](#downloading)
			- [Docker](#docker)
			- [Docker Machine](#docker-machine)
			- [Docker Compose](#docker-compose)
	- [Environment Variables](#environment-variables)
		- [.envset](#envset)
	- [Google OAuth](#google-oauth)
		- [Google OAuth callback on Docker Container](#google-oauth-callback-on-docker-container)
			- [Local Host](#local-host)
	- [CLI Tools](#cli-tools)
		- [REPL](#repl)
		- [Grunt Tasks](#grunt-tasks)
			- [menagerie:*](#menagerie)
				- [Using CLI to create a user and API token](#using-cli-to-create-a-user-and-api-token)
		- [Data Import/Export](#data-importexport)
			- [Services](#services)
			- [export-tables-to-csv](#export-tables-to-csv)
			- [import-csvs-to-table](#import-csvs-to-table)
	- [Legacy Grunt Tasks](#legacy-grunt-tasks)
			- [db:manage:*](#dbmanage)
- [User Manual](#user-manual)
	- [Basic Concepts](#basic-concepts)
	- [Entities](#entities)
		- [Device](#device)
		- [Location](#location)
		- [Device Type](#device-type)
		- [Deployment](#deployment)
		- [UUID](#uuid)
		- [UUID Short-codes](#uuid-short-codes)
		- [Check In and Check Out](#check-in-and-check-out)
		- [Device status](#device-status)
			- [unknown](#unknown)
			- [available](#available)
			- [reserved](#reserved)
			- [deployed](#deployed)
			- [broken](#broken)
		- [Deployed Device state](#deployed-device-state)
			- [unseen](#unseen)
			- [added](#added)
			- [online](#online)
			- [offline](#offline)
	- [Workflow](#workflow)
		- [Create Device Types](#create-device-types)
		- [Create Locations](#create-locations)
		- [Create Devices](#create-devices)
		- [Create Deployment](#create-deployment)
			- [Provision Devices](#provision-devices)
			- [Check Out Devices](#check-out-devices)
			- [Check In Devices](#check-in-devices)

<!-- /TOC -->

---
# Development

Menagerie is a [Node.js][njs] built using [Sails.js][sjs] and [MongoDB][mongo]. Initially it was using [PostgreSQL][psql] and there are some- maybe outdated- [grunt][grunt] [legacy tasks][#legacy-grunt-tasks] to manage migrations.

The guide also uses two tools to manage environment variables and to create `docker-compose` files for different environments. This tools are [envset][envset] and [slv][slv], which you can install using `nvm`. This tools are optional.

Menagerie uses Google OAuth for user authentication, and this guide also [covers briefly][#google-oauth] how to get up and running.

## Installation

The installation instructions provided here are for a development environment of Menagerie.

You could run the application on "bare metal"- maybe during development?- but this guide uses [Docker][docker], [Docker Machine][dmachine] and [Docker Compose][docker-compose].

You should have Docker [installed][docker-install], [Docker Machine][dmachine-install] as well as [Docker Compose][docker-compose-install]. All other dependencies are taken care by Docker!

This guide will walk you through a Docker setup, for a more in-depth understanding of Docker fundamentals check out Docker's documentation which is pretty good.

* [Docker for Mac getting started][docker-mac-get-started]
* [Docker Machine getting started][docker-machine-get-started]
* [Docker Compose getting started][docker-compose-get-started]

There are plenty of online resources and tutorials, like [this one][docker-tutorial], to get started.


### Getting started

#### Downloading

You have to get access to the source code by either using `git` or downloading the source code from the [Github repository][menagerie-link].

Clone using `git`, from terminal:
```
$ git clone git@github.com:goliatone/menagerie.git
```

When the git clone is complete- or when the archive is unzipped- you should see a file structure similar to this in your Menagerie installation directory.

[NOTE: FILE DIRECTORY IMAGE]

#### Docker

We use docker and docker-machine and a basic work-flow of `build` and `up`. You can take a look at the [Dockerfile][dockerfile].
There is a rule in `.gitignore` to not track under source control the `docker-compose.yml` file, instead there is a [template file][docker-compose-template] from which you need to generate a working `docker-compose.yml`.

Read more about the [template][#docker-compose].

#### Docker Machine

Ensure that your desired docker machine is up and running. In the rest of this guide we assume you have a machine named `dev`.

```
docker-machine start dev
```

If this is your first time using Docker Machine you might have to create a new machine. You can follow this guide [here][docker-machine-new].

#### Docker Compose

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


The basic commands that you will need are:


Build image:
```
docker-compose build
```

Bring the container up in detached mode:
```
docker-compose up -d
```

Brind down a container:
```
docker-compose down
```

If the container is not showing the changes you expect to see, you might have to re-build the image:

```
docker-compose build --no-cache
```

When your container is running, you can start a bash terminal into the container:
```
docker exec -ti menagerie_menagerie_1 /bin/bash
```

## Environment Variables

Currently we are using three docker environments:
- Development
- Staging
- Production

Each environment has a different set of environmental variables for things like the `mongodb` [connection] data or the google OAuth client information.

The environment variables currently used:

```
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
```

### .envset

There is a template file, [envset.tpl][envset-tpl] which lists all the different environments and the variables needed by the application. This template file is a simple text file with some variables grouped by environments. An environment is enclosed in `[` and `]`, such as `[development]`. Variables are in the form `VAR_NAME=<VALUE>`. You will need to replace all items between `<` and `>` with the actual value.

For example, replace `<NODE_MONGO_ENDPOINT>` with the actual URL to your MongoDB instance:
* `NODE_MONGO_ENDPOINT=mongodb`

If you decide to use [envset][envset] to manage your environment variables you should:

* Save the template file as `.envset`
* Replace all items between `<` and `>` with the actual value

`.gitignore` has a rule that ignores `.envset` so that your secrets are not added to source control.

## Google OAuth
To use Google OAuth, you need to create and configure a project in the google development environment.

Go to the [google developer console][gdc], and create a new project.

Configure OAuth consent screen- configure Domain Verification if needed.

Create client [ID credentials][credentials]. Select OAuth 2.0 client IDs option. I created three clients, one for each `docker` environment:

- Web Local
- Web Staging
- Web Production

For each environment, we need to create the following environment variables:
- NODE_GOOGLE_CLIENT_ID:Credentials screen.
- NODE_GOOGLE_CLIENT_SECRET: Credentials screen.
- NODE_CLIENT_BASE_URL

The first two you get from the Credentials screen, by clicking on the specific client.

The third is the base URL the OAuth callbacks should redirect to. IPs are not valid callbacks, `localhost` is a valid domain.

Your local development docker environment will not work with OAuth since you access the container through an IP address. You can create an entry on the `hosts` file in your Mac computer.

Enable APIs, [here][eapi]

### Google OAuth callback on Docker Container

To run OAuth callbacks inside the container we will configure a `hosts` entry in order to get a local domain as OAuth will not take IPs.

Get your docker's env IP, here I'm using a docker machine called **dev**:

```
$ docker-machine ip dev
192.168.99.100
```

#### Local Host
Add an entry to your hosts table routing the `docker-machine ip` of your environment to the `things.menagerie.dev` domain:

```
sudo nano /etc/hosts
```

Add the local domain.
```
192.168.99.100     things.menagerie.dev
```
Now you will be able to type `http://things.menagerie.dev` in your browser and it will resolve to the `192.168.99.100` IP.

## CLI Tools

Sails.js uses [Grunt][grunt] for [asset management][sails-tasks]. Menagerie adds custom grunt tasks intended to speed up development.

Menagerie comes with a [node REPL][node-repl] from which you can use all your models to interact with the database.


### REPL

Menagerie provides a [console][sails-console] intended for debug during development or even to inspect your container in production.

> This means you can access and use all of your models, services, configuration, and much more. Useful for trying out Waterline queries, quickly managing your data, and checking out your project's runtime configuration.

It can be helpful to be able to run the console inside a running docker container.

Create a `bash` session inside your container:

```
docker exec -ti menagerie_menagerie_1 /bin/bash
```

This will give you a prompt similar to this:
```
root@menagerie-development:/opt/menagerie#
```
From there you can run a new Menagerie instance in console mode. Note that you will have to use a different port than the one used by your application running in that container.

```
root@menagerie-development:/opt/menagerie# PORT=8998 ./node_modules/.bin/sails c
Starting app in interactive mode...

Welcome to the Sails console.
( to exit, type <CTRL>+<C> )

sails>
```

### Grunt Tasks

There are several custom grunt tasks:
* [menagerie:*][#menagerie]
* [db:manage:*][#db-manage] (legacy)

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

##### Using CLI to create a user and API token

Using [envset][envset] to manage connection environmental variables, so we can create a user in the development environment:

```
envset development -- grunt menagerie:user:create --username=iosclient --email=admin@menagerie.dev
```

The output should be something similar to this:

```
Running "menagerie:user:create" (menagerie:user) task

COMMAND create options { username: 'iosclient', email: 'admin@menagerie.dev' }
{ email: 'admin@menagerie.dev',
  username: 'iosclient',
  createdAt: '2016-10-12T14:20:27.123Z',
  updatedAt: '2016-10-12T14:20:27.123Z',
  id: '57fe46ab866ae9dd1de5a11a' }

Done, without errors.
```

Create a new OAuth token for a given user:
```
envset development -- grunt menagerie:token:create --userid=57fe46ab866ae9dd1de5a11a
```

You should see something similar to this:

```
Running "menagerie:token:create" (menagerie:token) task

COMMAND create options { userid: '57fe46ab866ae9dd1de5a11a' }
{ user: '57fe46ab866ae9dd1de5a11a',
  protocol: 'token',
  accessToken: 'XxDG8waPBoUsvs0IsKQ4HkNdYEW4V2HwozdFlogBPVMbfIxpYk5j2w0IXSEvXYGP',
  tokens: { token: 'XxDG8waPBoUsvs0IsKQ4HkNdYEW4V2HwozdFlogBPVMbfIxpYk5j2w0IXSEvXYGP' },
  createdAt: '2016-10-12T14:23:02.057Z',
  updatedAt: '2016-10-12T14:23:02.057Z',
  id: '57fe4746d6c3b5b91e2ec362' }

Done, without errors.
```

You can now use this information to access the API from a remote client:

```
GET /location HTTP/1.1
Host: menagerie.dev
Authorization: Bearer XxDG8waPBoUsvs0IsKQ4HkNdYEW4V2HwozdFlogBPVMbfIxpYk5j2w0IXSEvXYGP
Cache-Control: no-cache
User-Agent: Mozilla/2.02Gold (Win95; I)
Accept: */*
Accept-Encoding: gzip, deflate, sdch
Accept-Language: en-US,en;q=0.8,es;q=0.6,ca;q=0.4
Cookie: sails.sid=s%3AHEUdf5C9teJgOGDlGFSemsEmfaxPfuwX.D0F9y3Gayj4DGWY4X29S6eB1c6Mm%2BuTM0UovQu5SdfM
```

The important piece is the `Authorization` header with the value `Bearer XxDG8waPBoUsvs0IsKQ4HkNdYEW4V2HwozdFlogBPVMbfIxpYk5j2w0IXSEvXYGP`

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
$ envset production -- ./data/postgres/bin/export-tables-to-csv -t device,location,devicetype --verbose
```

You list all tables to be exported with the `-t` flag. This will generate a CSV file per table inside the **data/postgres/data** directory.

#### import-csvs-to-table

The following command would import data from each CSV file into a table with a matching name in the **development** environment:

```
envset development -- ./data/postgres/bin/import-csvs-to-table -t device,devicetype,location
```

To load data in the local development environment:
```
envset local -- ./data/postgres/bin/import-csvs-to-table -t device,devicetype,location
```

NOTE:

Currently you might get an error while doing export/import CSV:

>PG COPY error: invalid input syntax for integer

Quick fix:

```
sed -n 's/,,,,/,,,0,/gpw data/postgres/data/location.csv' data/postgres/data/location.csv
```


[njs]:https://nodejs.org/en/
[sjs]:http://sailsjs.org/
[mongo]:https://www.mongodb.com/
[psql]:https://www.postgresql.org/
[grunt]:https://grunt.io/

[docker]:https://www.docker.com/
[dmachine]:https://docs.docker.com/machine/
[docker-compose]:https://www.docker.com/products/docker-compose
[dmachine-install]:https://docs.docker.com/machine/install-machine/
[docker-install]:https://www.docker.com/products/overview/
[docker-compose-install]:https://docs.docker.com/compose/install/
[docker-mac-get-started]:https://docs.docker.com/docker-for-mac/
[docker-machine-get-started]:https://docs.docker.com/machine/get-started/
[docker-compose-get-started]:https://docs.docker.com/compose/gettingstarted/
[docker-machine-new]:https://docs.docker.com/machine/get-started/#/create-a-machine
[docker-tutorial]:http://prakhar.me/docker-curriculum/

[menagerie-link]:https://github.com/goliatone/menagerie/archive/master.zip
[dockerfile]:https://github.com/goliatone/menagerie/blob/master/Dockerfile
[docker-compose-template]:https://github.com/goliatone/menagerie/blob/master/docker-compose.tpl.yml
[tplenvset]: https://github.com/goliatone/envset/blob/master/example/tpl.envset
[envset]: https://github.com/goliatone/envset
[slv]: https://github.com/goliatone/slv
[mongodb-connection]:https://github.com/goliatone/menagerie/blob/deployments/config/connections.js#L43-L49
[envset-tpl]:https://github.com/goliatone/menagerie/blob/deployments/envset.tpl


[sails-tasks]:http://sailsjs.org/documentation/concepts/assets/default-tasks
[node-repl]:http://nodejs.org/api/repl.html
[sails-console]:http://sailsjs.org/documentation/reference/command-line-interface/sails-console

[gdc]: https://console.developers.google.com
[eapi]: https://console.developers.google.com/apis/library



-------
## Legacy Grunt Tasks
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

----
* [How to create an API token (CLI)](#using-cli-to-create-a-user-and-api-token)
* [How to create a bash session in docker](#docker-compose)
* How to bulk upload Device records using CSV (Web Admin)
* How to bulk upload Location records using CSV (Web Admin)
* How to bulk upload Device records using JSON (REPL)
* How to bulk upload Location records using JSON (REPL)


Snippet:

Checkout item using sockets

```
io.socket.post('/deployment/check-out',{
    location: '895E3355', //895E3355-92C3-41B6-BE87-6C96541E14FB
    device:'24730E62',  //24730E62-5382-4DE5-B253-EC924B45568C
    deployment:'F6373554'//F6373554-BD1C-4669-B52F-D206D54D963B
}, console.log);
```
# User Manual

This manual will help you start using with Menagerie.

## Basic Concepts

## Entities

Entities have an universally unique identifier UUID. Menagerie creates a QR code for Devices and Locations upon record creation.

The main entities in Menagerie are:

* Device
* DeviceType
* Location
* Deployment

### Device

A Device represents any instance of a device that you want to track using Menagerie. It could be an instance of a iBeacon.

Devices have an universally unique identifier UUID.

### Location
A Location is any physical space in which we want to deploy or store devices.

Locations have a _weight_ index property which more or less maps to:
* `100` -> Building
* `200` -> Floor
* `300` -> Area/Space
* `400` -> Room

### Device Type
A device type represents a type or class of device you want to track in Menagerie, like an iBeacon or Raspberry Pi.


### Deployment
A deployment is a group of devices in a location for a period of time.

### UUID
Most entities in Menagerie have a universally unique identifier or UUID. This is true for Devices, Locations, and Deployments.
An UUID looks like this `064BED24-886D-4BCA-B734-053DE72C57F7`.

When you create a new record that needs a UUID, if you don't provide one it will be created for you. However, if you have an external system that tracks Locations or Devices you can create a new record using the same UUID to keep consistency between systems.

UUIDs are unique for entities of the same class, meaning no two devices can have the same UUID or not two locations can have the same UUID.

### UUID Short-codes
Some actions that require a UUID- like check out- will also take a uuid short-code. A short-code is nothing more than the first 8 characters of an UUID. If we have the following UUID `064BED24-886D-4BCA-B734-053DE72C57F7` it's short code would be `064BED24`.

### Check In and Check Out
There are two main actions you will do over and over in Menagerie: checking out a device and checking in a device.

Checking out a device means that we are removing the device from the pool of available devices. You would do this after provisioning a device to a Deployment and once it's actually deployed in the field.

Checking in a device means that you are adding a device back to the pool of available devices, it will be available by default however the device might be broken so you might want to check it in with a state of `broken`.

### Device status
A device can be in on of 5 different status:

* [unknown][#unknown]
* [available][#available]
* [reserved][#reserved]
* [deployed][#deployed]
* [broken][#broken]

#### unknown
initial state, as entered into the system auto: default

#### available
We can manually set a device to be available through the Web panel or after we check the device in.
Only devices with a state of `available` will show up in the provisioning step of deployment.

#### reserved
When we add a device to a deployment, the device's status will be set to `reserved`.

#### deployed
After we have checked out a device it's state will be set to `deployed`.

#### broken
We have to manually set a device's status to broken, this will make it unavailable for deployments.

### Deployed Device state
Once a device has been deployed, it can have different states:
* [unseen][#unseen]
* [added][#added]
* [online][#online]
* [offline][#offline]

#### unseen
Default state of a device after being added to a Deployment.

#### added
Once a Device has been checked out, it will be confirmed as deployed and it's state set to `added`.

#### online
This signifies that the device is working as expected. We can set this manually or depending on the type of device there are different strategies to use this property to monitor the health of the device.

#### offline
A deployed device that stopped working as expected. We can set this manually or depending on the type of device there are different strategies to use this property to monitor the health of the device.


## Workflow
What follows is a simple step by step guide to get you up and running with the Menagerie's Web panel.


![wee](./docs/device-flow.png)

### Create Device Types
A Device Type provides a way to collect multiple device instances of the same class. In this example we are going to create a type of **ESP Humidity and Temperature Sensor**.  

![menagerie](./docs/screenshots/deice-type-list-empty.png)
![menagerie](./docs/screenshots/deice-type-list-add.png)
![menagerie](./docs/screenshots/deice-type-list-added.png)

### Create Locations
You can create records individually or import them using `CSV` files.

![menagerie](./docs/screenshots/location-list-empty.png)
![menagerie](./docs/screenshots/location-list-add.png)
![menagerie](./docs/screenshots/location-list-added.png)

### Create Devices
You can create records individually or import them using `CSV` files.

### Create Deployment
A deployment tacks a group of devices over a period of time and a location.

#### Provision Devices
You need to add devices to a deployment. Note that only devices with a status of `available` will be show up during the provisioning step.

#### Check Out Devices
#### Check In Devices
