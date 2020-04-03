const httpStatus = require('http-status');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerValidator = require('express-ajv-swagger-validation');
const _ = require('lodash');
const helmet = require('helmet');
const config = require('config');

const swaggerService = require('./services/swagger.service');

const swaggerPromise =
  config.swagger.generateSwaggerOnStartup === true
    ? swaggerService.generateSwagger()
    : Promise.resolve();
const appPromise = swaggerPromise
  .then(async () => {
    swaggerValidator.init(config.swagger.pathToBuiltSwagger, {
      makeOptionalAttributesNullable: true,
      ajvConfigBody: {
        coerceTypes: true,
        useDefaults: true,
      },
      ajvConfigParams: {
        useDefaults: true,
      },
    });

    const swaggerDocument = await swaggerService.getSwagger();

    const app = express();
    app.use(helmet());
    const corsOptions = {
      origin: config.cors.enabledOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
    };

    app.disable('x-powered-by');
    app.use(cors(corsOptions)); //in production a whitelist is a better idea
    app.use(
      bodyParser.json({
        type: ['application/vnd.api+json', 'application/json'],
      })
    );
    app.use(bodyParser.urlencoded({ extended: false }));

    // routing
    app.use('/', require('./controllers/heartbeat.controller'));

    app.use('/api-docs', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerDocument);
    });
    app.use('/api-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
      const err = new Error(`Not Found: ${req.method} ${req.originalUrl}`);
      err.status = httpStatus.NOT_FOUND;
      next(err);
    });

    // error handler
    app.use((err, req, res, next) => {
      if (err instanceof swaggerValidator.InputValidationError) {
        res.status(httpStatus.BAD_REQUEST).json({ details: err.errors });
      } else {
        console.error('Internal error: ', err);
        res
          .status(err.status || httpStatus.INTERNAL_SERVER_ERROR)
          .send('Internal server error');
      }
    });
    return app;
  })
  .catch((e) => {
    console.error('Error while starting application: ', e);
    throw e;
  });

async function getApp() {
  return await appPromise;
}

module.exports = {
  getApp,
};
