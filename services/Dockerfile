FROM node:12

COPY ais /app/ais
COPY location /app/location

RUN npm install ts-node -g
WORKDIR /app/location
RUN npm install

WORKDIR /app/ais
RUN npm install

WORKDIR /app
