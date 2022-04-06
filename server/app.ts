import bodyParser from 'body-parser';
import express, {
  Application,
  NextFunction,
  Request as ExRequest,
  Response as ExResponse,
} from 'express';
import * as http from 'http';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { ValidateError } from 'tsoa';
import { RegisterRoutes } from '../dist/routes';
import 'reflect-metadata';
import ApiError from './api-error'; // required for tsyringe

class App {
  private readonly PORT = process.env.PORT || 8000;

  private readonly app: Application = express();

  private server: http.Server | null = null;

  constructor() {
    // Use body parser to read sent json payloads
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );
    this.app.use(bodyParser.json());
    this.app.use(morgan('tiny'));
    this.app.use(
      express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
    );

    // Configure route for swagger docs
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      async (_req: ExRequest, res: ExResponse) => {
        return res.send(
          swaggerUi.generateHTML(await import('../dist/swagger.json'))
        );
      }
    );

    RegisterRoutes(this.app);

    // Handle not found errors
    this.app.use(function notFoundHandler(_req: any, res: ExResponse) {
      res.status(404).send({
        message: 'Not Found',
      });
    });

    // Handle all other error types
    this.app.use(function errorHandler(
      err: unknown,
      req: ExRequest,
      res: ExResponse,
      next: NextFunction
    ): ExResponse | void {
      // Provided  by tsoa to catch API errors where the input data is not the correct data type
      if (err instanceof ValidateError) {
        console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
        return res.status(422).json({
          message: 'Validation Failed',
          details: err?.fields,
        });
      }
      // Thrown manually from API methods when something is wrong
      if (err instanceof ApiError) {
        const apiError = err as ApiError;
        return res.status(apiError.statusCode).json({
          message: apiError.message,
        });
      }
      // Any other error
      if (err instanceof Error) {
        return res.status(500).json({
          message: 'Internal Server Error',
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

        return resolve(null);
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
