## Project setup

```bash
$ npm ci
```

Instal node_modules locally. Docker container uses local node_modules folder
Do not use npm install, need install dependencies strict to package-lock.json file, vulnerabilities fix

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Docker

```bash
# build container with params
$ docker-compose build

# container image starting
$ docker-compose up
```

## API Docs

Swagger: http://localhost:[env.PORT]/api/docs
