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
 *
 * @param {Model|Model[]} modelParam - model(s) to generate schemas for
 * @returns {GeneratedSwaggerYaml[]} generated JSON schemas in YAML format
 */
function generateSwagger(modelParam) {
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
 *
 * @param {Model|Model[]} modelParam - model(s) to generate schemas for
 * @param targetDir - directory to write generated schemas to
 * @returns {Promise} - promise that is resolved after schemas are written
 */
function saveSwagger(modelParam, targetDir) {
    validate.notNil(modelParam, 'modelParam is mandatory');
    validate.notNil(targetDir, 'targetDir is mandatory');

    const yamlSchemaContainers = generateSwagger(modelParam);
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
    generateSwagger,
    saveSwagger
};
