const _ = require('lodash');
const Model = require('objection').Model;
const yaml = require('js-yaml');
const validate = require('validation-utils');

const fileWriter = require('./file-writer');

/**
 * @typedef {Object} GeneratedSwaggerYaml
 * @property {string} name Name of the model
 * @property {string} schema JSON schema in YAML format
 */

/**
 * Generates JSON schemas for inclusion in Swagger specifications from Objection.js models
 * @param {Model|Model[]} modelParam - model(s) to generate schemas for
 * @returns {GeneratedSwaggerYaml[]} generated JSON schemas in YAML format
 */
function generateSchema(modelParam) {
    validate.notNil(modelParam, 'modelParam is mandatory');

    let models;
    if (modelParam.prototype instanceof Model) {
        models = [modelParam];
    } else if (_.isArray(modelParam)) {
        models = modelParam;
    } else {
        throw new Error('modelParam should be Model or an array of Models');
    }

    const schemaContainers = _.map(models, (model) => {
        return {
            name: model.name,
            schema: model.getJsonSchema()
        }
    });

    const yamlSchemaContainers = _.map(schemaContainers, (schemaContainer) => {
        return {
            name: schemaContainer.name,
            schema: yaml.dump(schemaContainer.schema)
        }
    });

    return yamlSchemaContainers;
}

/**
 * Generates and saves into specified directory JSON schema files for inclusion in Swagger specifications from given
 * Objection.js models
 * @param {Model|Model[]} modelParam - model(s) to generate schemas for
 * @param [string] targetDir - directory to write generated schemas to. Do not add '/' to the end.
 * @returns {Promise} - promise that is resolved after schemas are written
 */
function saveSchema(modelParam, targetDir) {
    validate.notNil(modelParam, 'modelParam is mandatory');
    validate.notNil(targetDir, 'targetDir is mandatory');

    const yamlSchemaContainers = generateSchema(modelParam);
    const writeEntries = _.map(yamlSchemaContainers, (yamlSchemaContainer) => {
            return {
                targetFile: `${targetDir}/${yamlSchemaContainer.name}.yaml`,
                data: yamlSchemaContainer.schema
            }
        }
    );
    return fileWriter.writeAll(writeEntries);
}

module.exports = {
    generateSchema,
    saveSchema
};
