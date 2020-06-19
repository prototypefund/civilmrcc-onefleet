FROM node:12

COPY ais /app/ais
COPY location /app/location

WORKDIR /app/location
RUN npm install
RUN npm run build

WORKDIR /app/ais
RUN npm install

WORKDIR /app
