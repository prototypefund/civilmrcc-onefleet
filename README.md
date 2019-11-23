# sar-app


## project description

A civil maritime rescue coordination center (cMRCC) - is a platform providing a GIS, a database and a communication infrastructure for NGOs who are operating in the field of Search and Rescue in the Mediterranean. OneFleet facilitates exchange between the different organizations involved so that they can become more efficient and flexible in their operations. Moreover, the application will provide the public with information on the activities in the Mediterranean. Its open infrastructure allows to easily exchange information.

## technical development

At the moment, the following steps are included in the development plan:

We will use VueJS as UI-framework in order to facilitate easy prototyping. As OneFleet should also be used on ships and airplanes, we will develop these offline first and then synchronize via Couch- / PouchDB. In this context, we would like to evaluate whether a different database could enable us to use the open source GIS QGIS. We will use the OpenLayers framework to display the maps. The data can be added to the database by operative organizations already during their mission so that they can be downloaded by interested journalists and research or legal teams later on. These functionalities aim at a better documentation of possible human rights violations and an enhanced cooperation between different organizations and operation types (e.g. boat, airplane).

## About this Repo
This repo contains all the services that you need to run to track and display vehicles and positions. It contains the main application which displays vehicles and cases on a map, the database in which locations, vehicles and positions are stored and the location-service which gathers e.g. ship locations to store them in the database. *The location-service and the database have to run when you start the app*

### Issues
Please report all issues in the [issue page](https://gitlab.com/niczem/onefleet/issues)


## Installation

## Clone the Repo

```
git clone https://gitlab.com/niczem/onefleet.git
cd onefleet
npm i
```

## Installation without Docker

### Start Location-Service
The location service runs in the background and requests the position data for vehicles in the database. To start it you have to run
```
cd services/location
npm i
npm run start
```
### Start Database
The database in this repo is a pouchdb-server instance. We highly recomend to use couchdb in production.

```
cd services/database
npm i
npm run start
```

## Installation with Docker


### Run development environment
```
docker-compose up
```

### Run prod environment

Copy the file `.env.template` to `.env`. Replace placeholder values in `.env` with real values. Then start the docker containers with:

```
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Compiles and minifies for production
```
docker-compose exec app npm run build
```

### Run your tests
```
docker-compose exec app npm run test
```

### Lints and fixes files
```
docker-compose exec app npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Manage docker containers

[Portainer](https://www.portainer.io/) is a simple UI tool to manage Docker containers and images. It has the same functionality as the Docker CLI tool, but is much more convenient to use.

To deploy Portainer on a Linux machine you simply have to execute these two commands:

```
docker volume create portainer_data
docker run -d -p 9000:9000 -p 8000:8000 --name portainer --restart always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer
```

After that the Portainer interface should be available at `http://<your-ip>:9000`. Before you can fully use Portainer you have to perform two more steps: 

- Set a password for the Admin-user
- Select "Local" as Docker environment.

For more information see the [documentation](https://portainer.readthedocs.io/en/stable/deployment.html).
