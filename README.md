# Description

GraphQL API for a track search service.


# Stack

We decided to use the NestJS framework as it offers a strong base for NodeJS APIs:
- Fully crafted with typescript
- Dependency Injection
- test infrastructure
- Deep Graphql integration
- Strong validation & guard API

We chose the Graphql codefirst API https://docs.nestjs.com/graphql/quick-start#code-first,
so we can drive our Graphql api from typescript class definitions & decorators.
Naturally, we use the full decorator offer from NestJS to add validation & jwt auth guard protection to our Graphql API.

Our GraphQL API is backed by the Prisma ORM, which features autogenerated type definition (prisma client) based on our prisma schema.
We use those types to ensure our graphQL model definition and query / mutations inputs match our underlying database model.

Overall, we chose to create a codebase bound to be extended, rather than limiting our tooling to the scope of the assignment, in order to show "real life" coding practices.


# Prerequesites

You have Docker and Node LTS installed on your machine.


# Installation

Clone the repository and run:

```bash
$ npm install
```


# Environment variables

For running the app and the tests, create an .env file at the root of the cloned repository.
In this .env file the following variables need to be declared:

- POSTGRES_USER: the posgresql user
- POSTGRES_PASSWORD: the posgresql user's password
- POSTGRES_DB: the posgresql Database name
- DATABASE_URL: the posgresql Database url, needed for prisma
- JWT_ACCESS_TOKEN_SECRET: the jwt access token secret
- JWT_ACCESS_TOKEN_EXPIRATION_TIME: the jwt access token expiration time
- ACR_CLOUD_API_ENDPOINT: arc cloud api endpoint
- ACR_CLOUD_API_KEY: your arc cloud api key, you can get one by signing up here https://console.acrcloud.com/signup#/register
- TEST_USER_EMAIL: the email used to seed a test user
- TEST_USER_PASSWORD: the password used to seed a test user

And .env.example is provided with dummy variables.


# Running the app

## 1. Infrastructure

First, spin off a postgresql database (which is the backend we chose for the prisma integration).
It can be done by running the following docker command:

```bash
$ docker-compose up -d
```

Apply migrations based on the prisma schema, and generate the prisma typescript client:

```bash
$ npx prisma migrate deploy --schema prisma/schema.prisma
$ npx prisma generate --schema prisma/schema.prisma
```


## 2. Seed a user

Since the /graphql endpoint is protected, create a user and login with its credentials.
For that matter we created a seed utility. Run it with

```bash
$ npm run seed
```

It will create a user based on the TEST_USER_EMAIL & TEST_USER_PASSWORD variables in your .env file.


## 3. Run the app

```bash
$ npm run start:dev
```


## 4. Login (with Postman for instance)

Make a POST request to the /auth/login endpoint (the server is serving our API on http://localhost:3000).
Body parameters (x-www-form-urlencoded): email & password.
The API returns an access_token, which can be used in the GraphQL playground available at /graphql.


## 5. GraphQL playground

When the app is running, browse GraphQL playground here: http://localhost:3000/graphql.
Since all queries / mutations are protected by Bearer token autentication, append a JSON object for each request in the HTTP HEADERS area such as :

```json
{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcwNzc0MzkyOSwiZXhwIjoxNzA3NzQ0ODI5fQ.CmtD_A5-m405VzgxU1ZLXnOL4b6m6zuo9Bk68tL7xpc"}
```


# Test

## unit tests

```bash
$ npm run test
```

## e2e tests

We did not create a specific instrastructure for e2e tests, so it needs to be ran against the same docker setup. The dockerized postgresql database needs to be up and running & migrations applied & the test user seeded.

```bash
$ npm run test:e2e
```

# Evaluation criteria

## GraphQL API

We make use of all of the fundamental tools nestJS GraphQL integration offers, such as the "code first", decorator based strategy in order to define the GraphQL schema & resolvers through class definitions, with decorator annotations. We end up with a couple of typescript files which follows Nest.js overall "class based" style, and which makes a good job at isolating the business logic from the whole graphQL API instrumentation.


## Type safety

We ensure type safety by:

- Making use of Nest.js graphQL code first approach so the graphQL schema is generated from class definitions & decorators
- Driving our application with prisma autogenerated types. Our GraphQL schema definitions are matched against ou prisma client types:
  - the GraphQL track model is isometric to prisma's track model. See src/track/models/track.model.ts, that class implements PrismaTrack
  - Our GraphQL query and mutations inputs are matched against Prisma query input types. See how our track resolver methods and their input types are matched against prisma types by calling the track service methods, whose arguments are typed with prisma types.
- Ensuring strong validation and proper mapping of the data coming from the Arccloud API (in the metadata service). See how we validate the responses and map it to the track-metadata.dto.ts definition, and how that definition is matching a Partial version of our prisma Track model. This way we ensure that data coming from that API is always correctly formatted.


## Authentication

In order to protect the graphQL endpoint, we created a Bearer token authentication strategy, exposed through the JwtAuthGuard in the auth module. That guard decorator is then used to protect all GraphQL endpoints, by annotating the whole TrackResolver class with @UseGuards(JwtAuthGuard);
That strategy involved creating a User model in our prisma schema, and a basic authentication endpoint available at /auth/login, which is used to fetch access tokens.


## Error handling

Regarding error management, we created custom GraphQL erros in the metadata service in case it does not function as intended (on top of the automatic graphQL error reporting we get from the NestJS graphQL integration). We also wrote a tiny error formater (see GraphQLModule configuration in src/app.module.ts) in order to correctly map and display exceptions thrown by the jwt auth guard and the global validation pipe configured in main.ts.


## Tests

In order to ensure an additonal level of safety, we properly unit tested all sensible business code methods,
such as the track service findTrackByNameAndArtistName method — which holds the logic of querying the database and the metada API — and all methods from the metadata service.

Finally we demonstrate a thorough completion of the task through a e2e test suite, see test/track.e2e-spect.ts.
This file also shows all possible queries and mutations properly formatted in graphQL syntax.
