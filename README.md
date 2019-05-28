# sar-app

## About this Repo
This repo contains all the services that you need to run to track and display vehicles and positions. It contains the main application which displays vehicles and cases on a map, the database in which locations, vehicles and positions are storerd and the location-service which gathers e.g. ship locations to store them in the database. *The location-service and the database have to run when you start the app*

### Issues
Please report all issues in the [issue page](https://gitlab.com/niczem/onefleet/issues)


## Installation

## Clone the Repo

```
git clone https://gitlab.com/niczem/onefleet.git
cd onefleet
```

## Installation without Docker

### Start Location-Service
The location service runs in the background and requests the position data for vehicles in the database. To start it you have to run
```
cd services/location
npm run start
```
### Start Database
The database in this repo is a pouchdb-server instance. We highly recomend to use couchdb in production.

```
cd services/database
npm run start
```

## Installation with Docker


### Run development environment
```
docker-compose up
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
