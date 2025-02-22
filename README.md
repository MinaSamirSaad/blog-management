<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
</p>

# Blog Management System

This is a NestJS project that includes user authentication, authorization, and CRUD operations. The project is built with TypeScript, Mongodb, and Mongoose, and includes testing with Jest and documentation with Swagger.


## Getting Started

### Prerequisites

- Node.js >= v20
- pnpm or npm
- MongoDB Server

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/MinaSamirSaad/blog-management
    cd blog-management
    ```

2. Install dependencies:
    ```bash
    pnpm install
    # or
    npm install
    ```

3. Set up environment variables:
  * create .env file and add this content inside it  
    ```bash
    DATABASE_URL= "your mongo database url"
    JWT_SECRET= "secret key for JWT"
    PORT= "the port tht you wnt the server to run on it"
    ```

### Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Run tests


```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Endpoints

### Blogs

* **GET api/blogs**
  * get all blogs.
* **POST api/blogs**
  * Creates a new blog.
* **GET api/blogs/{id}**
  * get a specific blog by ID.
* **PATCH api/blogs/{id}**
  * Updates a specific blog by ID.
* **DELETE api/blogs/{id}**
  * Deletes a specific blog by ID.
* **GET api/blogs/search?{keyword}**
  * get all blogs that title and content matches this keyword.
* **GET api/blogs/filter?{category}&{owner}**
  * get all filtered blogs by category or owner or both.
* **GET api/blogs/paginated?{page}&{limit}**
  * get all blogs paginated.


### Authentication

* **POST api/auth/signup**
  * Creates a new user account.
* **POST api/auth/signin**
  * Signs in a user.
* **POST api/auth/whoami**
  * to know who the current user or get user profile.

## Data Models

* **UserDto:** Represents a user response.
* **CreateBlogDto:** Represents a blog creation request.
* **BlogDto:** Represents a blog response.
* **UpdateBlogDto:** Represents a blog update request.
* **SignUpDto:** Represents a user creation request.
* **SigninDto:** Represents a user signin request.


## API Documentation

For full API documentation, please refer to the [Swagger Documentation](
  https://blog-management-theta.vercel.app/api/docs/
).
