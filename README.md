## Project setup

```bash
$ npm ci
```

Do not use npm install, need install dependencies stict to package-lock.json file, vulnerabilities fix

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
# cp docker files to app root / dir: [development] or [production]
$ cp docker/development/* ./

# build container with params
$ docker-compose build

# container image starting
$ docker-compose up
```

## API Docs

Swagger: http://localhost:[env.PORT]/api/docs
