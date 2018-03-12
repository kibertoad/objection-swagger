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
		const processedSchema = _processModel(model, opts);

		return {
			name: model.name,
			schema: yaml.dump(processedSchema)
		}
	});
}

/**
 *
 * @param {Object} model - Objection model
 * @param {Options} opts
 * @returns {*}
 */
function _processModel(model, opts) {
	const schema = model.getJsonSchema ? model.getJsonSchema() : undefined;
	if (!schema) {
		return {};
	}

	const processedSchema = _processSchema(schema, opts);
	_fillRelationshipFields(model, processedSchema, opts);
	return processedSchema;
}

function _processSchema(schema, opts) {
	const processedSchema = clone(schema);
	if (opts.excludeInternalData) {
		delete processedSchema.additionalProperties;
	}
	_processFields(schema, processedSchema);
	return processedSchema;
}

function _processFields(schema, processedSchema) {
	const isFillRequiredList = !processedSchema.required;
	if (!processedSchema.required) {
		processedSchema.required = [];
	}

	_.forOwn(schema.properties, (value, key) => {
		if (value.private) {
			delete processedSchema.properties[key];
		} else {
			//Fill 'required' field field for non-nullable fields
			if (value.type) {
				if (_.isArray(value.type)) {
					//Swagger 2.0 does not support multiple-value types and neither it does oneOf, so we have to just pick first one
					processedSchema.properties[key].type = value.type[0];
					if (isFillRequiredList && !_propertyIsNullable(value)) {
						processedSchema.required.push(key);
					} else {
						_requiredFieldSanityCheck(key, processedSchema.required.includes(key), _propertyIsNullable(value))
					}
				} else {
					if (isFillRequiredList) {
						processedSchema.required.push(key);
					} else {
						_requiredFieldSanityCheck(key, processedSchema.required.includes(key), _propertyIsNullable(value))
					}
				}
			}
		}
	});

	//Swagger validation considers empty required attribute to be invalid
	if (processedSchema.required.length === 0) {
		delete processedSchema.required;
	}
}

function _propertyIsNullable(propertyEntry) {
	return Array.isArray(propertyEntry.type) && propertyEntry.type.includes('null');
}

function _requiredFieldSanityCheck(key, isRequired, isNullable) {
	if (isRequired && isNullable) {
		throw new Error(`Parameter ${key} is explicitly defined as required and from model it looks like it is nullable. Unable to make decision if field is required.`);
	}
}

function _getRefForModel(model) {
	return `$ref: ${model.name}.yaml`;
}

/**
 *
 * @param model
 * @param processedSchema
 * @param {Options} opts
 */
function _fillRelationshipFields(model, processedSchema, opts) {
	_.forOwn(model.relationMappings, (relationEntry, key) => {
		if (Model.HasOneRelation === relationEntry.relation) {
			processedSchema.properties[key] = _resolveSchemaForRelation(model, relationEntry, opts);
			_addDescription(processedSchema, key, relationEntry);
		} else if (Model.HasManyRelation === relationEntry.relation) {
			const items = _resolveSchemaForRelation(model, relationEntry, opts);
			processedSchema.properties[key] = {
				type: 'array',
				items
			};
			_addDescription(processedSchema, key, relationEntry);
		}
	});
}

function _addDescription(processedSchema, key, relationEntry) {
	if (relationEntry.description) {
		processedSchema.properties[key].description = relationEntry.description;
	}
}

function _resolveSchemaForRelation(processedClass, relationEntry, opts) {
	const relatedClass = _.isString(relationEntry.modelClass) ? require(relationEntry.modelClass) : relationEntry.modelClass;
	let result;

	//protect against endless recurstion
	if (processedClass !== relatedClass) {
		result = opts.useEntityRefs ? _getRefForModel(relatedClass) : _processModel(relatedClass, opts);
	} else {
		result = {
			type: 'object'
		};
	}
	return result;
}

function _writeYaml(yamlSchemaContainers, targetDir, opts){
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
	return _writeYaml(yamlSchemaContainers, targetDir, opts);
}

/**
 * Generates and saves into specified directory JSON schema files for inclusion in Swagger specifications from given
 * Objection.js models
 * @param {Object|Object[]} schemaParam - JSON-Schema(s) to generate yamls for. Title param is used as a filename
 * @param {string} targetDir - directory to write generated schemas to. Do not add '/' to the end.
 * @param {Options} opts
 * @returns {Promise} - promise that is resolved after yarml are written
 */
function saveNonModelSchema(schemaParam, targetDir, opts = {}) {
	validate.notNil(schemaParam, 'schemaParam is mandatory');
	validate.notNil(targetDir, 'targetDir is mandatory');

	if (!Array.isArray(schemaParam)) {
		schemaParam = [schemaParam];
	}
	const yamlSchemaContainers = _.map(schemaParam, (schema) => {
		const processedSchema = _processSchema(schema, opts);

		return {
			name: schema.title,
			schema: yaml.dump(processedSchema)
		}
	});

	return _writeYaml(yamlSchemaContainers, targetDir, opts);
}

module.exports = {
	generateSchema,
	saveNonModelSchema,
	saveSchema
};
