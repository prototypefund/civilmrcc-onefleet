#/bin/sh

docker pull registry.gitlab.com/civilmrcc/onefleet/app:latest
docker pull registry.gitlab.com/civilmrcc/onefleet/services:latest
docker-compose up -d