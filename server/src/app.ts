import * as http from 'node:http';
import { ValidateError } from 'tsoa';
import 'reflect-metadata'; // required for tsyringe
import morgan from 'morgan';
import * as path from 'node:path';
import * as swaggerUi from 'swagger-ui-express';
import { Application, NextFunction, Request as ExRequest, Response as ExResponse } from 'express';
import * as bodyParser from 'body-parser';
import { singleton } from 'tsyringe';
import express = require('express');
import cors from 'cors';
import ApiError from './api-error';
import { RegisterRoutes } from '../generated/routes';
import AppInterface from './app-interface';

import swaggerDocument from '../generated/swagger.json';

@singleton()
class App implements AppInterface {
  public readonly app: Application = express();

  private readonly PORT = process.env.PORT || 3030;

  private server: http.Server | null = null;

  private readonly corsAllowlist = ['https://example1.com', 'https://example2.com'];

  private readonly corsOptions: cors.CorsOptions = {
    origin: this.corsAllowlist,
  };

  constructor() {
    // Use body parser to read sent json payloads
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );
    this.app.use(cors(this.corsOptions));
    this.app.set('etag', false);
    this.app.use(bodyParser.json());
    this.app.use(morgan('tiny'));
    this.app.use(express.static(path.join(__dirname, '..', 'dist/public'), { maxAge: 31_557_600_000 }));

    // Configure route for swagger docs
    const options = { explorer: true };
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

    // Register the routes auto generated from the controllers
    RegisterRoutes(this.app);

    // Handle not found errors
    this.app.use(function notFoundHandler(_request: ExRequest, res: ExResponse) {
      res.status(404).send({
        message: 'Not Found',
      });
    });

    // Handle all other error types
    this.app.use(function errorHandler(
      error: unknown,
      request: ExRequest,
      res: ExResponse,
      next: NextFunction
    ): ExResponse | void {
      // Provided  by tsoa to catch API errors where the input data is not the correct data type
      if (error instanceof ValidateError) {
        console.warn(`Caught Validation Error for ${request.path}:`, error.fields);
        return res.status(422).json({
          message: 'Validation Failed',
          details: error?.fields,
        });
      }
      // Thrown manually from API methods when something is wrong
      if (error instanceof ApiError) {
        const apiError = error as ApiError;
        return res.status(apiError.statusCode).json({
          message: apiError.message,
        });
      }
      // Any other error
      if (error instanceof Error) {
        return res.status(500).json({
          message: `Internal Server Error: ${error.message}`,
        });
      }

      return next();
    });
  }

  /**
   * Start the server
   */
  public start(): Promise<any> {
    return new Promise<any>((resolve) => {
      this.server = this.app.listen(this.PORT, () => {
        const url = `http://localhost:${this.PORT}`;
        console.log(`Listening on ${url}\t\tAPI Docs: ${url}/api-docs`);
        return resolve(undefined);
      });
    });
  }

  /**
   * Stop the server if running
   */
  public stop(): Promise<boolean> {
    return new Promise<boolean>((resolve: Function) => {
      if (this.server) {
        this.server.close(() => {
          resolve(true);
        });
      } else {
        resolve(true);
      }
    });
  }
}

export default App;
