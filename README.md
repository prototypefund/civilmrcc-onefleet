# sar-app

## Clone the Repo

```
git clone https://gitlab.com/niczem/onefleet.git
cd onefleet
```

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
