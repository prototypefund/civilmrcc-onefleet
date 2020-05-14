# READ ME

## **Search-and-Rescue App**

## **Backround Information**

The civil Maritime Rescue Coordination Center (civilMRCC) is a coordination and documentation platform for distress cases in the Mediterranean Sea. One of the main components is the OneFleet App. It consists out of a livesystem and a historical database. 

In the Central Mediterranean, there are many different actors involved in Search-and-Rescue operations. The cMRCC aims for a better coordination and smoother communication about boats in maritime distress between all the involved organisations and networks. Also the app will be used to collect more data and information on the incidents in the Mediterranean and provide the public with this information. E.g. this can be used by journalists or researchers.

## **Goal**

For the better coordination of distress cases in the Mediterranean, as well as monitoring, we set up this App as an OpenSource project and call it OneFleet. It is a platform providing a geo-information-system (GIS) and a database for organizations operating in the field of Search and Rescue in the Mediterranean. OneFleet facilitates exchange between the different organizations involved so that they can become more efficient and flexible in their operations. Moreover, the application will provide the public with information on the activities in the Mediterranean. Its open infrastructure allows to easily exchange information.
![](https://i.imgur.com/HYG0Dus.png)

## **Technical development**

At the moment, the following steps are included in the development plan:
We will use VueJS as UI-framework in order to facilitate easy prototyping. As OneFleet should also be used on ships and airplanes, we will develop these offline first and then synchronize via Couch- / PouchDB. In this context, we would like to evaluate whether a different database could enable us to use the open source GIS QGIS. We will use the OpenLayers framework to display the maps. The data can be added to the database by operative organizations already during their mission so that they can be downloaded by interested journalists and research or legal teams later on. These functionalities aim at a better documentation of possible human rights violations and an enhanced cooperation between different organizations and operation types (e.g. boat, airplane).
For a detailed listing about all the requested functions and features see the backlog.

## **About this Repo**

This repo contains all the services that you need to run to track and display vehicles and positions. It contains the main application which displays vehicles and cases on a map, the database in which locations, vehicles and positions are stored and the location-service which gathers e.g. ship locations to store them in the database. The location-service and the database have to run when you start the app

[![](https://mermaid.ink/img/eyJjb2RlIjoiY2xhc3NEaWFncmFtXG4gICAgICBDb3VjaERCIDx8LS0-IENsaWVudDE6IHN5bmNcbiAgICAgIENvdWNoREIgPHwtLT4gQ2xpZW50Mjogc3luY1xuICAgICAgQ291Y2hEQiA8fC0tIENsaWVudDM6IHN5bmNcbiAgICAgIENvdWNoREIgPHwtLSBMb2NhdGlvblNlcnZpY2VzXG4gICAgICBIaXN0b3JpY2FsRGF0YWJhc2UgPHwtLSBDb3VjaERCXG4gICAgICBDb3VjaERCIDogY29udGFpbnMgbGl2ZSBkYXRhXG4gICAgICBjbGFzcyBDbGllbnQxe1xuICAgICAgICAgIHJ1bnMgb25lZmxlZXQgaW4gYnJvd3NlclxuICAgICAgfVxuICAgICAgY2xhc3MgQ2xpZW50MntcbiAgICAgICAgICBydW5zIG9uZWZsZWV0IGluIGJyb3dzZXJcbiAgICAgIH1cbiAgICAgIGNsYXNzIENsaWVudDN7XG4gICAgICAgICAgcnVucyBvbmVmbGVldCBpbiBicm93c2VyXG4gICAgICB9XG4gICAgICBjbGFzcyBMb2NhdGlvblNlcnZpY2Vze1xuICAgICAgICAgICthaXMgc2VydmljZVxuICAgICAgICAgICttYWlsIHNlcnZpY2VcbiAgICAgIH1cbiAgICAgIGNsYXNzIEhpc3RvcmljYWxEYXRhYmFzZXtcbiAgICAgICAgICBjb250YWlucyBoaXN0b3JpY2FsIGRhdGFcbiAgICAgICAgICAobm90IHBhcnQgb2YgdGhpcyByZXBvKVxuICAgICAgfSIsIm1lcm1haWQiOnsidGhlbWUiOiJkZWZhdWx0In0sInVwZGF0ZUVkaXRvciI6ZmFsc2V9)](https://mermaid-js.github.io/mermaid-live-editor/#/edit/eyJjb2RlIjoiY2xhc3NEaWFncmFtXG4gICAgICBDb3VjaERCIDx8LS0-IENsaWVudDE6IHN5bmNcbiAgICAgIENvdWNoREIgPHwtLT4gQ2xpZW50Mjogc3luY1xuICAgICAgQ291Y2hEQiA8fC0tIENsaWVudDM6IHN5bmNcbiAgICAgIENvdWNoREIgPHwtLSBMb2NhdGlvblNlcnZpY2VzXG4gICAgICBIaXN0b3JpY2FsRGF0YWJhc2UgPHwtLSBDb3VjaERCXG4gICAgICBDb3VjaERCIDogY29udGFpbnMgbGl2ZSBkYXRhXG4gICAgICBjbGFzcyBDbGllbnQxe1xuICAgICAgICAgIHJ1bnMgb25lZmxlZXQgaW4gYnJvd3NlclxuICAgICAgfVxuICAgICAgY2xhc3MgQ2xpZW50MntcbiAgICAgICAgICBydW5zIG9uZWZsZWV0IGluIGJyb3dzZXJcbiAgICAgIH1cbiAgICAgIGNsYXNzIENsaWVudDN7XG4gICAgICAgICAgcnVucyBvbmVmbGVldCBpbiBicm93c2VyXG4gICAgICB9XG4gICAgICBjbGFzcyBMb2NhdGlvblNlcnZpY2Vze1xuICAgICAgICAgICthaXMgc2VydmljZVxuICAgICAgICAgICttYWlsIHNlcnZpY2VcbiAgICAgIH1cbiAgICAgIGNsYXNzIEhpc3RvcmljYWxEYXRhYmFzZXtcbiAgICAgICAgICBjb250YWlucyBoaXN0b3JpY2FsIGRhdGFcbiAgICAgICAgICAobm90IHBhcnQgb2YgdGhpcyByZXBvKVxuICAgICAgfSIsIm1lcm1haWQiOnsidGhlbWUiOiJkZWZhdWx0In0sInVwZGF0ZUVkaXRvciI6ZmFsc2V9)

## **Contributing Guide**

We would love for you to contribute to OneFleet and help make it even better than it is today and #SafePassage and lives! As a contributor, here are the guidelines we would like you to follow:

- [Installation Guide](#Installation-Guide)
- [Code of Conduct](https://gitlab.com/civilmrcc/onefleet/blob/master/CODE_OF_CONDUCT.md)
- [Issue Reporting Guidelines](#Issue-Reporting-Guidelines)
- [Pull Request Guidelines](#Pull-Request-Guidelines)

## Development

Recommended editor is [Visual Studio Code](https://code.visualstudio.com/) with the extension [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) to support `.vue` files.

## **Installation Guide**

### Clone the Repo

```
git clone https://gitlab.com/civilmrcc/onefleet.git
cd onefleet
npm i
```

---

### Installation

#### Start Frontend

The frontend is built on Vue.js. To start it you have to run:

```
npm i
npm serve
```

After that you can open the frontend at http://localhost:8080/

#### Start Location-Service

The location service runs in the background and requests the position data for vehicles in the database. To start it you have to run

```
cd services/location
npm i
npm start
```

#### Start Database

The database in this repo is a pouchdb-server instance. We highly recomend to use couchdb in production.

```
cd services/database
npm i
npm start
```

### Docker

#### Create docker image

This onefleet uses two separate docker images: One for the Vue-application, and another for the backend services. To create a new docker image run the following commands:

```
npm install
npm run build
docker build -t registry.gitlab.com/civilmrcc/onefleet/app .
docker build -t registry.gitlab.com/civilmrcc/onefleet/services services
```

#### Create docker container

Start the docker containers with:

```
docker-compose up -d
```

**NOTE**: The option `-d` means the the containers will be started in a "detached mode", meaning they will keep running even if the user session is closed.

To update the prod environment first pull a new docker image with `docker pull registry.gitlab.com/civilmrcc/onefleet/master:latest` and then execute the deployment command again.

**NOTE**: The file `deploy.sh` does exactly this.

An example output of the deployment script looks like this:

```
$ sh deploy.sh
latest: Pulling from civilmrcc/onefleet/master
Digest: sha256:7b4e73b0843a50d3ed22bdb1470ac716593d34fa594f81cb8db9708fa266d427
Status: Image is up to date for registry.gitlab.com/civilmrcc/onefleet/master:latest
registry.gitlab.com/civilmrcc/onefleet/master:latest
onefleet_database_1 is up-to-date
onefleet_ais_1 is up-to-date
Starting onefleet_bootstrap_1 ... done
Starting onefleet_location_1  ... done
Creating onefleet_app_1       ... done
```

#### Debugging JavaScript files with Visual Studio Code and Chrome

Enable remote debugging in Chrome. You can do that by starting Chrome with `chrome.exe --remote-debugging-port=9222`. If you are using Windows you can simply [edit the Chrome shortcut](https://stackoverflow.com/a/56457835/2306587) to start Chrome with remote debugging enabled.

Start the vue application with `npm run serve` and navigate to http://localhost:8080/ in Chrome.

Open the project in Visual Studio Code and launch the task "Attach to Chrome" to start the debugger. If the debugger successfully attached to chrome you should see some console output in the tab "DEBUG CONSOLE".

Now you can add break points to your JavaScript files to pause script execution.

**NOTE**: Currently debugging works for .js files, but not for .vue files.

#### Customize configuration

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

### Automatically update containers with Watchtower

With [Watchtower](https://github.com/containrrr/watchtower) you can automatically update containers when a new docker image is available.

```
docker run -d --name watchtower -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower onefleet.app onefleet.ais onefleet.location
```

### Automatically clean up unused docker images

When a newer docker image is pulled to a host the older image still remains on the host. This means that over time a lot of unused images will accumulated on the host, and the free space on the host will continually decrease.

To prevent the host from beeing swamped with older images it is prudent to perform a regular cleanup job. This can be done with `docker prune`. This command will remove any unused images, containers and volumes from the host. It is recommended to create a daily cronjob to perform the docker cleanup. Example output:

```
$ docker system prune -f
Deleted Containers:
4b71d312123496fe01b7e2b64b07f818abcfbac12fe69db5601edefcdac52bbb
c43b3b797b0912770beb6e059f798ab6afdc5c5ea4983a05aeb08a98995ca291
4400153a985f8568a7ff7059eab361b7d722ef80781edc743d6d4455aca6b5b7

Deleted Images:
deleted: sha256:af498107b991b85588bfa7374e110603ed70146770f82e0daad7dd5fe36a6c16
deleted: sha256:d65bd1604a78313fcb0eb62d7617678a5e9efb620b7bfd56724dfa2ead182b2f
untagged: registry.gitlab.com/civilmrcc/onefleet/services@sha256:a2602345f2f4e46990abdacfcb14e8fbe3620fd33ce61d7346f16cb7b97c2da4
deleted: sha256:b127232f37ee91f7269b765a6ff4cea1408899e12eff5d53d1aee15dd78e5371
deleted: sha256:b135ac74cc7aa8b9283ca5dd25b8547d2ae2e72452c435bd776bcddf525fefb4

Total reclaimed space: 1.317GB
```

### Backup database files

The database data files of the PouchDB should be backed up regularily. The file location depends on how the database was started.

If the database was started as a node process the data files are located in `services/database/data`.

If the database was started as a docker container the data files are located in `services/database/docker_mount`.

### Issue Reporting Guidelines

The issue list is reserved exclusively for bug reports and feature requests, not for usage questions. Please use the discord channel for that.
Please report all issues in the [issue page](https://gitlab.com/civilmrcc/onefleet/issues). There make sure that the bug or feature was not already reported, or please link dublicated cards together.

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
