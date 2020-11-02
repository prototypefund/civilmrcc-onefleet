#/bin/sh

docker pull registry.gitlab.com/civilmrcc/onefleet/app:development
docker pull registry.gitlab.com/civilmrcc/onefleet/services:development
docker-compose up -d