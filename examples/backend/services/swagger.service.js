const swaggerJSDoc = require('swagger-jsdoc');
const objectionSwagger = require('objection-swagger');
const swaggerCombine = require('swagger-combine');
const mkdirp = require('mkdirp-promise');
const config = require('config');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const PATH_TO_BUILT_SWAGGER = config.swagger.pathToBuiltSwagger;

let builtSwaggerSchema;

const modelContainer = require('require-all')({
  dirname: `${__dirname}/../models/entities`,
  filter: /(.+model)\.js$/,
  recursive: false,
});

const responsesContainer = require('require-all')({
  dirname: `${__dirname}/../models/responses`,
  filter: /(.+response)\.js$/,
  recursive: false,
});

const queriesContainer = require('require-all')({
  dirname: `${__dirname}/../models/queries`,
  filter: /(.+query)\.js$/,
  recursive: false,
});

const models = _.values(modelContainer);
const responses = _.values(responsesContainer);
const queries = _.values(queriesContainer);

const options = {
  swaggerDefinition: {
    info: {
      title: 'Example application',
      version: '1.0.0',
    },
  },
  apis: ['./controllers/**/*.js'],
};

async function generateSwagger() {
  const swaggerDir = path.dirname(PATH_TO_BUILT_SWAGGER);
  const pathToTmpSwagger = `${swaggerDir}/tmpSwagger.yaml`;

  //Generate YAML for controllers
  const swaggerFromControllers = swaggerJSDoc(options);
  const swaggerYaml = yaml.safeDump(swaggerFromControllers);
  await mkdirp(swaggerDir);
  fs.writeFileSync(pathToTmpSwagger, swaggerYaml);

  //Generate YAML for models
  await objectionSwagger.saveSchema(models, swaggerDir);
  await objectionSwagger.saveNonModelSchema(responses, swaggerDir);
  await objectionSwagger.saveQueryParamSchema(queries, swaggerDir);

  //Combine YAMLs
  builtSwaggerSchema = await swaggerCombine(pathToTmpSwagger);
  fs.writeFileSync(PATH_TO_BUILT_SWAGGER, yaml.safeDump(builtSwaggerSchema));
  return builtSwaggerSchema;
}

/**
 * Returns generated swagger
 *
 * @returns {Promise<Object>} swagger object
 */
async function getSwagger() {
  if (builtSwaggerSchema) {
    return builtSwaggerSchema;
  }
  return generateSwagger();
}

function getSwaggerSync() {
  if (builtSwaggerSchema) {
    return builtSwaggerSchema;
  }
  throw new Error(
    'Swagger document was not yet initialized. Make sure you are only calling this method after initialization phase is done.'
  );
}

module.exports = {
  generateSwagger,
  getSwagger,
  getSwaggerSync,
};
