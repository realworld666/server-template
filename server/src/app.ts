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
import ApiError from './api-error';
import { RegisterRoutes } from '../generated/routes';
import AppInterface from './app-interface';

import swaggerDocument from '../generated/swagger.json';

const cors = require('cors');

@singleton()
class App implements AppInterface {
  public readonly app: Application = express();

  private readonly PORT = process.env.PORT || 3030;

  private server: http.Server | null = null;

  constructor() {
    // Use body parser to read sent json payloads
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );
    this.app.use(cors());
    this.app.options('*', cors(this.corsOptionsDelegate));
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
    this.app.use(function notFoundHandler(_request: any, res: ExResponse) {
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

  private allowlist = ['http://example1.com', 'http://example2.com'];

  private corsOptionsDelegate(req: any, callback: any) {
    console.log('CORS!');
    let corsOptions;
    if (this.allowlist.indexOf(req.header('Origin')) !== -1) {
      corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
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
    return new Promise<boolean>((resolve: any) => {
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
