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
	return propertyEntry.type.includes('null')
}

function _requiredFieldSanityCheck(key, isRequired, isNullable) {
	if (isRequired && isNullable) {
		throw new Error(`Parameter ${key} is explicitly defined as required and from model it looks like it is nullable. Unable to make decision if field is required.`);
	}
}

function getRefForModel(model) {
	return `$ref: ${model.name}.yaml`;
}

/**
 *
 * @param model
 * @param processedSchema
 * @param {Options} opts
 */
function fillRelationshipFields(model, processedSchema, opts) {
	_.forOwn(model.relationMappings, (relationEntry, key) => {
		if (Model.HasOneRelation === relationEntry.relation) {
			processedSchema.properties[key] = resolveSchemaForRelation(model, relationEntry, opts);
			addDescription(processedSchema, key, relationEntry);
		} else if (Model.HasManyRelation === relationEntry.relation) {
			const items = resolveSchemaForRelation(model, relationEntry, opts);
			processedSchema.properties[key] = {
				type: 'array',
				items
			};
			addDescription(processedSchema, key, relationEntry);
		}
	});
}

function addDescription(processedSchema, key, relationEntry) {
	if (relationEntry.description) {
		processedSchema.properties[key].description = relationEntry.description;
	}
}

function resolveSchemaForRelation(processedClass, relationEntry, opts) {
	const relatedClass = _.isString(relationEntry.modelClass) ? require(relationEntry.modelClass) : relationEntry.modelClass;
	let result;

	//protect against endless recurstion
	if (processedClass !== relatedClass) {
		result = opts.useEntityRefs ? getRefForModel(relatedClass) : processSchema(relatedClass, opts);
	} else {
		result = {
			type: 'object'
		};
	}
	return result;
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
