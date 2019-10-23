const _ = require('lodash');
const yaml = require('js-yaml');
const validate = require('validation-utils').validationHelper;

const jsonSchemaTransformer = require('./transformers/json-schema.transformer');
const modelTransformer = require('./transformers/model.schema.transformer');
const queryParamTransformer = require('./transformers/query-param.schema.transformer');
const yamlWriter = require('./utils/yaml.writer');

/**
 * @typedef {Object} GeneratedSwaggerYaml
 * @property {string} name Name of the model
 * @property {string} schema JSON schema in YAML format
 */

/**
 * @typedef {Object} GeneratedSwagger
 * @property {string} name Name of the model
 * @property {Object} schema JSON schema
 */

/**
 * Generates JSON schemas for inclusion in Swagger specifications from Objection.js models
 * @param {Model|Model[]} modelParam - model(s) to generate schemas for
 * @param {Options} opts
 * @returns {GeneratedSwaggerYaml[]} generated JSON schemas as strings (in YAML format)
 */
function generateSchema(modelParam, opts = {}) {
  const rawResult = generateSchemaRaw(modelParam, opts);
  return rawResult.map((resultEntry) => {
    return {
      name: resultEntry.name,
      schema: yaml.dump(resultEntry.schema),
    };
  });
}

/**
 * Generates JSON schemas from Objection.js models
 * @param {Model|Model[]} modelParam - model(s) to generate schemas for
 * @param {Options} opts
 * @returns {GeneratedSwagger[]} generated JSON schemas as objects
 */
function generateSchemaRaw(modelParam, opts = {}) {
  validate.notNil(modelParam, 'modelParam is mandatory');

  let models;
  if (_.isArray(modelParam)) {
    models = modelParam;
  } else if (_.isObject(modelParam)) {
    models = [modelParam];
  } else {
    throw new Error('modelParam should be an object or an array of objects');
  }

  return models.map((model) => {
    const processedSchema = modelTransformer.transformJsonSchemaFromModel(
      model,
      opts
    );

    return {
      name: model.name,
      schema: processedSchema,
    };
  });
}

/**
 * Generates and saves into specified directory JSON schema files for inclusion in Swagger specifications from given
 * Objection.js models
 * @param {Model|Model[]} modelParam - model(s) to generate schemas for
 * @param {string} targetDir - directory to write generated schemas to. Do not add '/' to the end.
 * @param {Options} opts
 * @returns {Promise} - promise that is resolved after schemas are written
 */
function saveSchema(modelParam, targetDir, opts = {}) {
  validate.notNil(modelParam, 'modelParam is mandatory');
  validate.notNil(targetDir, 'targetDir is mandatory');

  const yamlSchemaContainers = generateSchema(modelParam, opts);
  return yamlWriter.writeYamlsToFs(yamlSchemaContainers, targetDir, opts);
}

/**
 * Generates and saves into specified directory JSON-schema YAML files for inclusion in Swagger specifications from
 * given JSON-schemas
 * @param {Object|Object[]} schemaParam - JSON-Schema(s) to generate yamls for. Title param is used as a filename
 * @param {string} targetDir - directory to write generated schemas to. Do not add '/' to the end.
 * @param {Options} opts
 * @returns {Promise} - promise that is resolved after yamls are written
 */
function saveNonModelSchema(schemaParam, targetDir, opts = {}) {
  validate.notNil(schemaParam, 'schemaParam is mandatory');
  validate.notNil(targetDir, 'targetDir is mandatory');

  if (!Array.isArray(schemaParam)) {
    schemaParam = [schemaParam];
  }
  const yamlSchemaContainers = schemaParam.map((schema) => {
    const processedSchema = jsonSchemaTransformer.transformSchema(schema, opts);

    return {
      name: schema.title,
      schema: yaml.dump(processedSchema),
    };
  });

  return yamlWriter.writeYamlsToFs(yamlSchemaContainers, targetDir, opts);
}

/**
 * Generates and saves into specified directory JSON-schema YAML files for inclusion in Swagger query param
 * specifications from given JSON-schemas
 * @param {Object|Object[]} schemaParam - JSON-Schema(s) to generate yamls for. Title param is used as a filename
 * @param {string} targetDir - directory to write generated schemas to. Do not add '/' to the end.
 * @param {Options} opts
 * @returns {Promise} - promise that is resolved after yamls are written
 */
function saveQueryParamSchema(schemaParam, targetDir, opts = {}) {
  validate.notNil(schemaParam, 'schemaParam is mandatory');
  validate.notNil(targetDir, 'targetDir is mandatory');

  if (!Array.isArray(schemaParam)) {
    schemaParam = [schemaParam];
  }
  const yamlSchemaContainers = schemaParam.map((schema) => {
    const modelSchema = jsonSchemaTransformer.transformSchema(schema, opts);
    const queryParamSchema = queryParamTransformer.transformIntoQueryParamSchema(
      modelSchema
    );

    return {
      name: schema.title,
      schema: yaml.dump(queryParamSchema),
    };
  });

  return yamlWriter.writeYamlsToFs(yamlSchemaContainers, targetDir, opts);
}

module.exports = {
  generateSchema,
  generateSchemaRaw,
  saveNonModelSchema,
  saveQueryParamSchema,
  saveSchema,
};
