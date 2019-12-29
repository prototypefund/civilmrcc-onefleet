# READ ME

## **Search-and-Rescue App**
## **Backround Information**
A Maritime Rescue Coordination Center (MRCC) is a state run facilty to coordinate and provide Search-and-Rescue (SAR) operations for distress cases at sea. They are responsible for a geographic area. In the Central Mediterranen Italy, Malta and Libya are running this MRCCs. With the new government in Italy (2018) the priorities in the coordination slowly shifted from an effective, fast & safe rescue to push backs to Libya by any means necessary. This development turns the Libyan SAR region into a deadly blackbox. Nowadays distress cases are often not coordinated at all and information is not shared in a way to make a fast & safe rescue possible. If a rescue takes place and people are not pushed back to Libya in violation of the Geneva refugee convention, often disembarkation is denied for days or even weeks. The result is that more and more merchant vessel do not react to distress cases any more or carry out illegal push back themselves.
We do not want to accept a human rights free zone on the mediterranean. Therefore both issues, the coordination of distress cases in the moment they occur, as well as the monitoring and follow-up of human rights violations at sea, have to be addressed.

## **Goal**
For the better coordination of distress cases in the Mediterranean, as well as the monitoring and follow-up of human rights violations at sea a civil maritime rescue coordination center (cMRCC), we set up this App as an OpenSource project and call it OneFleet. It is a platform providing a geo-information-syste (GIS), a database and a communication infrastructure for NGOs who are operating in the field of Search and Rescue in the Mediterranean. OneFleet facilitates exchange between the different organizations involved so that they can become more efficient and flexible in their operations. Moreover, the application will provide the public with information on the activities in the Mediterranean. Its open infrastructure allows to easily exchange information.
![](https://i.imgur.com/HYG0Dus.png)


## **Technical development**
At the moment, the following steps are included in the development plan:
We will use VueJS as UI-framework in order to facilitate easy prototyping. As OneFleet should also be used on ships and airplanes, we will develop these offline first and then synchronize via Couch- / PouchDB. In this context, we would like to evaluate whether a different database could enable us to use the open source GIS QGIS. We will use the OpenLayers framework to display the maps. The data can be added to the database by operative organizations already during their mission so that they can be downloaded by interested journalists and research or legal teams later on. These functionalities aim at a better documentation of possible human rights violations and an enhanced cooperation between different organizations and operation types (e.g. boat, airplane).
For a detailed listing about all the requested functions and features see the backlog. 

## **About this Repo**
This repo contains all the services that you need to run to track and display vehicles and positions. It contains the main application which displays vehicles and cases on a map, the database in which locations, vehicles and positions are stored and the location-service which gathers e.g. ship locations to store them in the database. The location-service and the database have to run when you start the app

## **Contributing Guide**
We would love for you to contribute to OneFleet and help make it even better than it is today and #SafePassage and lives! As a contributor, here are the guidelines we would like you to follow:

- [Installation Guide](#Installation-Guide)
- [Code of Conduct](https://gitlab.com/niczem/onefleet/blob/master/CODE_OF_CONDUCT.md)
- [Issue Reporting Guidelines](#Issue-Reporting-Guidelines)
- [Pull Request Guidelines](#Pull-Request-Guidelines)

## **Installation Guide**
### Clone the Repo

```
git clone https://gitlab.com/niczem/onefleet.git
cd onefleet
npm i
```

---

### Installation without Docker

#### Start Location-Service
The location service runs in the background and requests the position data for vehicles in the database. To start it you have to run
```
cd services/location
npm i
npm run start
```
#### Start Database
The database in this repo is a pouchdb-server instance. We highly recomend to use couchdb in production.

```
cd services/database
npm i
npm run start
```
---

### Installation with Docker


#### Run development environment
```
docker-compose up
```

#### Run prod environment

Copy the file `.env.template` to `.env`. Replace placeholder values in `.env` with real values. Then start the docker containers with:

```
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

#### Compiles and minifies for production
```
docker-compose exec app npm run build
```

#### Run your tests
```
docker-compose exec app npm run test
```

#### Lints and fixes files
```
docker-compose exec app npm run lint
```

#### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Issue Reporting Guidelines
The issue list is reserved exclusively for bug reports and feature requests, not for usage questions. Please use the discord channel for that.
Please report all issues in the [issue page](https://gitlab.com/niczem/onefleet/issues). There make sure that the bug or feature was not already reported, or please link dublicated cards together.


Write detailed information because it is very helpful to understand an issue. For example:
- How to reproduce the issue, step-by-step.
- The expected behavior.
- What is actually happening (or what is wrong)?
- The operating system.
- Screenshots always help a lot.

### Pull Request Guidelines
The master branch is just a snapshot of the latest stable release. All development should be done in dedicated branches. Do not submit (Pull Requests) PRs against the master branch.
Checkout a topic branch from the relevant branch and merge back against that branch.
Overview of Branches:

- master
- develop (must be added in future)
- feature/[ISSUENUMBER]-[FEATURENAME]
example feature branch: 
feature/19-left-navigation-update-on-change

## **Credits**
Special thanks to everyone who already contributed to the project:
(Here should be the names or the links to the profiles)
