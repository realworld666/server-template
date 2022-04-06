# swagger-backend-api-sample

This is a sample project of using two npm packages to simplify API documentation and testing. The project is a nodejs Typescript application using express  as the web application framework.

## typescript-rest
This package is an annotation-based expressjs extension for typescript used to define your APIs using decorators. It has similarities with ASP.NET and  its use of attributes on methods to define the APIs behaviour.

Additionally it provides a web route to Swagger API docs that can be generated from a swagger yaml file. This web route displays all the endpoints and provides a way to test the API from the documentation.  

## typescript-rest-swagger
This package is a compile time tool that generates the  Swagger yaml file. It builds  on the `typescript-rest` package  by reading the decorators on the  API to generate the documentation.

# usage
To run the project:
1. Run `npm  install` in the project root
2. Run `npm run dev` to start the project. The API docs can be viewed and tested from http://localhost:8000/api-docs
