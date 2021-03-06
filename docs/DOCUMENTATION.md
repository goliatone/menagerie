# Menagerie

Menagerie is a prototype of a Device Management System for IoT devices.

With Menagerie you keep an inventory of your (hardware) devices, as well as help you in keeping track of their location and status over time as well as having a centralized repository for their configurations.

It can be used with it's companion iOs [scanner application][ios-app] to simplify the workflow.

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
			- [menagerie:* task](#menagerie-task)
				- [Using CLI to create a user and API token](#using-cli-to-create-a-user-and-api-token)
		- [Data Import/Export](#data-importexport)
			- [Services](#services)
			- [export-tables-to-csv](#export-tables-to-csv)
			- [import-csvs-to-table](#import-csvs-to-table)
- [User Manual](#user-manual)
	- [Basic Concepts](#basic-concepts)
		- [UUID](#uuid)
		- [UUID Short-codes](#uuid-short-codes)
		- [Check In and Check Out](#check-in-and-check-out)
	- [Entities](#entities)
		- [Device](#device)
		- [Device Type](#device-type)
		- [Location](#location)
		- [Deployment](#deployment)
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
		- [QR Codes](#qr-codes)
	- [Workflow](#workflow)
		- [Create Device Types](#create-device-types)
		- [Create Locations](#create-locations)
		- [Create Devices](#create-devices)
		- [Create Floorplan](#create-floorplan)
		- [Create Deployment](#create-deployment)
			- [Provision Devices](#provision-devices)
			- [Check Out Devices](#check-out-devices)
			- [Check In Devices](#check-in-devices)
			- [Location Devices](#location-devices)
	- [Legacy Grunt Tasks](#legacy-grunt-tasks)
			- [db:manage:* task](#dbmanage-task)

<!-- /TOC -->

---
# Development

Menagerie is a [Node.js][njs] built using [Sails.js][sjs] and [MongoDB][mongo]. Initially it was using [PostgreSQL][psql] and there are some- maybe outdated- [grunt][grunt] [legacy tasks][#legacy-grunt-tasks] to manage migrations.

The guide also uses two tools to manage environment variables and to create `docker-compose` files for different environments. This tools are [envset][envset] and [slv][slv], which you can install using `nvm`. This tools are optional.

Menagerie uses Google OAuth for user authentication, and this guide also [covers briefly][#google-oauth] how to get up and running.

## Installation

The installation instructions provided here are for a development environment of Menagerie.

You could run the application on "bare metal"- maybe during development?- but this guide uses [Docker][docker], [Docker Machine][dmachine] and [Docker Compose][dockercompose].

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

Read more about the [docker-compose template][#docker-compose].

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

![google-creds](./google-creds.png)

Create client [ID credentials][credentials]. Select OAuth 2.0 client IDs option. I created three clients, one for each `docker` environment:

- Web Local
- Web Staging
- Web Production

![google-oauth-credentials](./google-oauth-credentials.png)

For each environment, we need to create the following environment variables:
- NODE_GOOGLE_CLIENT_ID:Credentials screen.
- NODE_GOOGLE_CLIENT_SECRET: Credentials screen.
- NODE_CLIENT_BASE_URL

The first two you get from the Credentials screen, by clicking on the specific client.

![google-oauth-credentials-details](./google-oauth-credentials-details.png)

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
* [menagerie:*][#menagerie-task]
* [db:manage:*][#dbmanage] (legacy)

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

#### menagerie:* task

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

# User Manual

This manual will help you start using with Menagerie.

## Basic Concepts

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

## Entities

Entities have an universally unique identifier UUID. Menagerie creates a QR code for Devices and Locations upon record creation.

The main entities in Menagerie are:

* Device
* DeviceType
* Location
* Deployment

### Device

A Device represents any instance of a device that you want to track using Menagerie. It could be an instance of a iBeacon.

Device entities have the following attributes:

* UUID
* Name
* Description
* Device ID
* Asset Tag
* Status
* Type
* Location
* Metadata

### Device Type
A device type represents a type or class of device you want to track in Menagerie, like an iBeacon or Raspberry Pi.

Device Type entities have the following attributes:

* Name
* Description
* Label
* Manufacturer
* Model
* Metadata

The metadata attribute stores any JSON data we want. Note it should be valid JSON.

### Location
A Location is any physical space in which we want to deploy or store devices.

Location entities have the following attributes:

* UUID
* Name
* Description
* Location Type
* Parent Location
* Floor plan

Locations have a _weight_ index property which more or less maps to:
* `100` -> Building
* `200` -> Floor
* `300` -> Area/Space
* `400` -> Room

### Deployment
A deployment is a group of devices in a location for a period of time.

### Device status
A device can be in on of 5 different status:

* [unknown](#unknown)
* [available](#available)
* [reserved](#reserved)
* [deployed](#deployed)
* [broken](#broken)

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
* [unseen](#unseen)
* [added](#added)
* [online](#online)
* [offline](#offline)

#### unseen
Default state of a device after being added to a Deployment.

#### added
Once a Device has been checked out, it will be confirmed as deployed and it's state set to `added`.

#### online
This signifies that the device is working as expected. We can set this manually or depending on the type of device there are different strategies to use this property to monitor the health of the device.

#### offline
A deployed device that stopped working as expected. We can set this manually or depending on the type of device there are different strategies to use this property to monitor the health of the device.

### QR Codes
Menagerie generates QR codes for both Devices and Locations. You can generate an HTML page with a list of UUIDs and QR codes for both Devices and locations enabling you to save to PDF.

Another approach is to use an online service like [this one][my-ass-et-tag] which will take a list of UUIDs and send you a sheet with all the QR codes.

You could send a list of UUIDs of entities which you already have created or do the inverse, create any amount of UUIDs using something like [uuidgen][uuidgen], print the tags, and then every time you create a Location or a Device you use one of the UUIDs from the sheet.

![asset-tag-pies](./asset-tag-pies.jpeg)

## Workflow
What follows is a simple step by step guide to get you up and running with the Menagerie's Web panel.


![wee](./device-flow.png)

### Create Device Types
A Device Type provides a way to collect multiple device instances of the same class. In this example we are going to create a type of **ESP Humidity Sensor**.  

![menagerie](./screenshots/device-type-list-empty.png)

![menagerie](./screenshots/device-type-add.png)

We can see that the device type has been created successfully.

![menagerie](./screenshots/device-type-list-added.png)

### Create Locations
We are now going to create a Location to represent a building, which will have the code name **NY15**.

![menagerie](./screenshots/location-add.png)

We can see the record after it was created:

![menagerie](./screenshots/locations-list-after-manual-create.png)

Locations have an _index_ property which more or less maps to:
* `100`: Building
* `200`: Floor
* `300`: Area/Space
* `400`: Room

We are going to create a second Location to represent a floor, **NY15-2FL** and assign it's parent property to **NY15**. This second location is maps to the 2nd floor or our sample building.

![locations-list-sublocation](http://i.imgur.com/Znl43ed.png)

You can also create Location records by importing a `CSV` file.

There is a file with sample data available [here][csv-sample-location]. Here we can see the contents:
```csv
"uuid","name","description","index","floorplan","parent"
"932476A7-D3E0-4336-AB2F-03204606EE9F","DC01","DC Gramercy","100","",""
"B1205714-E664-4FBC-8D5C-0759A16663B8","NY15-3FL","NYC Chelsea 3rd Floor","200","","57fcfa755351cee4e3a75da5"
"","NY15-4FL","NYC Chelsea 4th Floor","200","","57fcfa755351cee4e3a75da5"
"","NY15-5FL","NYC Chelsea 5th Floor","200","57fd388e5f519d3a045621e7","57fcfa755351cee4e3a75da5"
```

The fields provided in this example are the following:

* uuid: Not if not present one will be auto-generated
* name
* description
* index
* parent: ID of parent Location

Simply upload the file:
![menagerie](./screenshots/locations-upload-csv.png)

The records will be created. Note that the records which had a parent ID have been correctly populated.
![menagerie](./screenshots/locations-list-after-csv.png)

### Create Devices

When we visit the Devices section, we see it's empty.

![device-list-empty](http://i.imgur.com/nF58f1P.png)

We are going to create a device manually.

![device-add](http://i.imgur.com/PwNk8bl.png)

You can also create records by importing a `CSV` file. The fields provided in this example are the following:

* type: ID to Device Type
* uuid: Not if not present one will be auto-generated
* name
* assetTag
* deviceId
* description
* status: If not present it will be set to `unknown`


The file is also available [here][csv-sample]. Here we can see the contents:
```csv
"type","uuid","assetTag","deviceId","name","description","status"
"57fcfa035351cee4e3a75da4","3611214D-4B0D-4007-893D-514E95804AB1","x192844f9","375484","ESP Humidity 02","ESP8266 Battery Powered Humidity Sensor ","available"
"57fcfa035351cee4e3a75da4","76E9CCB9-55ED-4ECB-AE10-274DC1B0C178","x192845ca","325485","ESP Humidity 03","ESP8266 Battery Powered Humidity Sensor ","available"
"57fcfa035351cee4e3a75da4",,"x192846cc","355983","ESP Humidity 04","ESP8266 Battery Powered Humidity Sensor ","available"
"57fcfa035351cee4e3a75da4",,"x192847ca","345142","ESP Humidity 05","ESP8266 Battery Powered Humidity Sensor ","available"
"57fcfa035351cee4e3a75da4",,"x192848ba","395411","ESP Humidity 06","ESP8266 Battery Powered Humidity Sensor ","available"
```

Upload the CSV file.

![device-upload-csv](http://i.imgur.com/X9MRkVS.png)

List of created devices:

![device-list-after-csv-upload](http://i.imgur.com/57F39WW.png)

![device-list-after-manual-create](http://i.imgur.com/H6bB6SZ.png)


### Create Floorplan
We are going to create a Floorplan, by uploading an image.


Add the floorplan to our **NY15-2FL** location.

![location-add-floorplan](http://i.imgur.com/Y70Bifl.png)

### Create Deployment
A deployment tacks a group of devices over a period of time and a location. We will name this deployment **NY15 Fridge Study**

![deployment-add](./screenshots/deployment-add.png)

We can see that the Deployment has been successfully created.

![deployment-list-created](./screenshots/deployment-list-created.png)

#### Provision Devices
You need to add devices to a deployment. Note that only devices with a status of `available` will be show up during the provisioning step.

![provisioning-devices](http://i.imgur.com/VVyyksw.png)

#### Check Out Devices

If you list the devices that have been added to the deployment.


![deployed-devices-list](./screenshots/deployed-devices-list.png)


After we complete a check out for a device, we can see that it's state has been updated. It went from `unseen` to `seen`.


![deployed-devices-checked-in](./screenshots/deployed-devices-checked-in.png)

#### Check In Devices


#### Location Devices
A Location has the ability to display Devices placed on the location's floor-plan (if it has one).

We can position our devices in the device's location floor plan.

![location-devices-map](http://i.imgur.com/1yMp0Ua.png)

If we click in one of the listed devices it will be positioned in the floor plan. Once there we can drag it and place it where we want in the floor plan.

![location-device-map-place](./screenshots/location-device-map-place.png)


![location-device-map-placed](./screenshots/location-device-map-placed.png)

If we change the location or a device, or if we check-in a deployed device then the device will not be shown in the map.




-------
## Legacy Grunt Tasks
#### db:manage:* task

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




[njs]:https://nodejs.org/en/
[sjs]:http://sailsjs.org/
[mongo]:https://www.mongodb.com/
[psql]:https://www.postgresql.org/
[grunt]:https://grunt.io/

[docker]:https://www.docker.com/
[dmachine]:https://docs.docker.com/machine/
[dockercompose]:https://www.docker.com/products/docker-compose
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
[credentials]: https://console.developers.google.com/apis/credentials

[sails-tasks]:http://sailsjs.org/documentation/concepts/assets/default-tasks
[node-repl]:http://nodejs.org/api/repl.html
[sails-console]:http://sailsjs.org/documentation/reference/command-line-interface/sails-console

[gdc]: https://console.developers.google.com
[eapi]: https://console.developers.google.com/apis/library

[csv-sample]:./device_import.csv
[csv-sample-location]:./location_import.csv
[ios-app]:https://github.com/jkachmar/menagerie-v2-mobile
[my-ass-et-tag]:http://www.myassettag.com/
[uuidgen]:https://linux.die.net/man/1/uuidgen
