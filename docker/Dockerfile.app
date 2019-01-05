FROM node:10

ENV PATH=/app/node_modules/.bin:${PATH}

RUN mkdir -p /app
WORKDIR /app

CMD ["npm", "run", "dev"]
