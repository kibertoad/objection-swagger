const _ = require('lodash');
const Model = require('objection').Model;
const yaml = require('js-yaml');
const validate = require('validation-utils');
const clone = require('clone');

const fileWriter = require('./file-writer');

/**
 * @typedef {Object} GeneratedSwaggerYaml
 * @property {string} name Name of the model
 * @property {string} schema JSON schema in YAML format
 */


/**
 *
 * @param {Object} model - Objection model
 * @param {Options} opts
 * @returns {*}
 */
function processSchema(model, opts) {
	const schema = model.getJsonSchema();
	const processedSchema = clone(schema);
	//Swagger validation considers empty required attribute to be invalid
	if (processedSchema.required && processedSchema.required.length === 0) {
		delete processedSchema.required;
	}
	if (opts.excludeInternalData) {
		delete processedSchema.additionalProperties;
	}
	processFields(schema, processedSchema);
	fillRelationshipFields(model, processedSchema, opts);
	return processedSchema;
}

/**
 * Generates JSON schemas for inclusion in Swagger specifications from Objection.js models
 * @param {Model|Model[]} modelParam - model(s) to generate schemas for
 * @param {Options} opts
 * @returns {GeneratedSwaggerYaml[]} generated JSON schemas in YAML format
 */
function generateSchema(modelParam, opts = {}) {
	validate.notNil(modelParam, 'modelParam is mandatory');

	let models;
	if (modelParam.prototype instanceof Model) {
		models = [modelParam];
	} else if (_.isArray(modelParam)) {
		models = modelParam;
	} else {
		throw new Error('modelParam should be Model or an array of Models');
	}

	return _.map(models, (model) => {
		const processedSchema = processSchema(model, opts);

		return {
			name: model.name,
			schema: yaml.dump(processedSchema)
		}
	});
}

function processFields(schema, processedSchema) {
	_.forOwn(schema.properties, (value, key) => {
		if (value.private) {
			delete processedSchema.properties[key];
		} else
		//Swagger 2.0 does not support multiple-value types and neither it does oneOf
		if (value.type && _.isArray(value.type)) {
			processedSchema.properties[key].type = value.type[0]
		}
	});
}

function fillRelationshipFields(model, processedSchema, opts) {
	_.forOwn(model.relationMappings, (relationEntry, key) => {
		const relatedClass = require(relationEntry.modelClass);
		if (Model.HasOneRelation === relationEntry.relation) {
			processedSchema.properties[key] = processSchema(model, relatedClass, opts)
		} else if (Model.HasManyRelation === relationEntry.relation) {
			processedSchema.properties[key] = {
				type: 'array',
				items: processSchema(relatedClass, opts)
			}
		}
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
	const writeEntries = _.map(yamlSchemaContainers, (yamlSchemaContainer) => {
			const suffix = opts.useSuffix || '';
			return {
				targetFile: `${targetDir}/${yamlSchemaContainer.name}${suffix}.yaml`,
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
