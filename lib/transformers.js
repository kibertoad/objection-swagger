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

	if (model.relationMappings) {
		return enrichSchemaWithRelationships(model.jsonSchema, model.relationMappings, modelClass)
	}
	return model.jsonSchema;
}

/**
 * Creates copy of provided schema and enriches it with attributes that are derived from relationships
 * @param {Object} schema - JSON Schema
 * @param {Object} relationships - Objection.js relationMappings
 * @returns {Object} JSON Schema object
 */
function enrichSchemaWithRelationships(schema, relationships, fromModelClass) {
	const processedSchema = _.cloneDeep(schema);

	_.forOwn(relationships, (value, key) => {
			let relationshipValue;
			if (value.relation.name === Model.HasOneRelation.name) {
				//protect from endless recursion
				const modelProperties = value.modelClass !== fromModelClass ? _resolveModelProperties(value.modelClass, schema) : { type: 'object' };
				relationshipValue = {
					..._resolveModelProperties(value.modelClass, schema)
				}
			} else if (value.relation.name === Model.HasManyRelation.name) {
				//protect from endless recursion
				const modelProperties = value.modelClass !== fromModelClass ? _resolveModelProperties(value.modelClass, schema) : { type: 'object' };
				relationshipValue = {
					type: 'array',
					items: {
						...modelProperties
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
