FROM node:12

COPY ais /app/ais
COPY location /app/location

RUN npm install ts-node -g
RUN npm install typescript -g
RUN npm @types/node  -g

WORKDIR /app/location
RUN npm install

WORKDIR /app/ais
RUN npm install

WORKDIR /app
