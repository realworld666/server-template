[![Node.js CI](https://github.com/realworld666/server-template/actions/workflows/node.js.yml/badge.svg)](https://github.com/realworld666/server-template/actions/workflows/node.js.yml)

# swagger-backend-api-sample

This is a sample project to use as a base for a REST Api. The project uses two core packages to facilitate this; `tsoa` and `tsyringe`

# requirements
* `node 16.18`
* `ts-node`

## tsoa
This package is an annotation-based expressjs extension for typescript used to define your APIs using decorators. It has similarities with ASP.NET and  its use of attributes on methods to define the APIs behaviour.

A code generation step is performed as part of any build or CI/CD process which will generate the express routes from the Typescript annotations.

Types can be defined as typescript interfaces to be used in the method parameters or return types of the REST API. The code generator will create run time type checks on the data passed into the API and throw an HTTP error if the data is in an unexpected format.

An OpenAPI compliant yaml file is also generated as part of the build process. More information on `tsoa` is [here](https://github.com/lukeautry/tsoa).

In addition to this, I use [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen) in the `public` folder to generate a Swagger Open API documentation file that can be used from a web browser to test the API and display usage documentation

## tsyringe
This package is a lightweight dependency injection container for TypeScript/JavaScript for constructor injection.

This package is overkill for a small API but used as good practice. It's a design pattern I like which helps reduce dependencies between different parts of the code base and adds support for swapping out implementations of certain modules which is especially useful in tests.

# usage
To run the project:
1. Run `./install` to run all of the installers
2. Run `./build` in the project root
3. Run `./start` to start the project. The API docs can be viewed and tested from http://localhost:8000/api-docs
