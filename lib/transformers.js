const _ = require('lodash');

const Model = require('objection').Model;

/**
 * Transforms Swagger query params into correct JSON Schema
 * @param {Object} queryModel - Swagger query params model
 * @returns {Object} JSON Schema object
 */
function fromSwaggerQuerySchema(queryModel) {
	const requiredFields = [];
	const transformedProperties = {};
	_.forOwn(queryModel.items.properties, (value, key) => {
		if (value.required) {
			requiredFields.push(key);
		}
		transformedProperties[key] = {
			...value
		};

		if (!_.isNil(transformedProperties[key].required)) {
			delete transformedProperties[key].required;
		}
	});

	return {
		title: queryModel.title,
		description: queryModel.description,
		additionalProperties: false,
		required: requiredFields,
		properties: transformedProperties
	}
}

function _resolveModelProperties(modelClass) {
	const model = _.isString(modelClass) ? require(modelClass) : modelClass;
	return model.relationMappings ? enrichSchemaWithRelationships(model.jsonSchema, model.relationMappings) : model.jsonSchema;
}

/**
 * Creates copy of provided schema and enriches it with attributes that are derived from relationships
 * @param {Object} schema - JSON Schema
 * @param {Object} relationships - Objection.js relationMappings
 */
function enrichSchemaWithRelationships(schema, relationships) {
	const processedSchema = _.cloneDeep(schema);

	_.forOwn(relationships, (value, key) => {
			let relationshipValue;
			if (value.relation.name === Model.HasOneRelation.name) {
				relationshipValue = {
					..._resolveModelProperties(value.modelClass)
				}
			} else if (value.relation.name === Model.HasManyRelation.name) {
				relationshipValue = {
					type: 'array',
					items: {
						..._resolveModelProperties(value.modelClass),
					},
				};
			}
			if (relationshipValue) {
				processedSchema.properties[key] = relationshipValue;
			}
		}
	);

	return processedSchema;

}

module.exports = {
	enrichSchemaWithRelationships,
	fromSwaggerQuerySchema
};
