const path = require('path');
const { transformSchema } = require('../transformers/json-schema.transformer');
const constants = require('../constants');
const _ = require('lodash');

/**
 * Creates copy of provided schema and enriches it with attributes that are derived from relationships
 * @param {Object} schema - JSON Schema
 * @param {Object} relationships - Objection.js relationMappings
 * @param {boolean} isIncludeParentRelationships - whether ManyToManyRelation and BelongsToOneRelation relationships should be included
 * @param {Object} [fromModelClass] - model class from which enrichment was initiated
 * @param {string[]} [modelPaths] - model base paths for loading relations when modelClass is a string
 * @returns {Object} JSON Schema object
 */
function enrichSchemaWithRelationships(
  schema,
  relationships,
  isIncludeParentRelationships,
  fromModelClass,
  modelPaths
) {
  const processedSchema = _.cloneDeep(schema);

  _.forOwn(relationships, (value, key) => {
    let relationshipValue;
    if (value.relation.name === constants.HasOneRelation) {
      //protect from endless recursion
      const modelProperties =
        value.modelClass !== fromModelClass
          ? _resolveModelProperties(
              value.modelClass,
              true,
              isIncludeParentRelationships,
              modelPaths
            )
          : { type: 'object' };
      relationshipValue = {
        ...modelProperties,
      };
    } else if (
      isIncludeParentRelationships &&
      value.relation.name === constants.BelongsToOneRelation
    ) {
      //protect from endless recursion
      const modelProperties =
        value.modelClass !== fromModelClass
          ? _resolveModelProperties(
              value.modelClass,
              false,
              isIncludeParentRelationships,
              modelPaths
            )
          : { type: 'object' };
      relationshipValue = {
        ...modelProperties,
      };
    } else if (value.relation.name === constants.HasManyRelation) {
      //protect from endless recursion
      const modelProperties =
        value.modelClass !== fromModelClass
          ? _resolveModelProperties(
              value.modelClass,
              true,
              isIncludeParentRelationships,
              modelPaths
            )
          : { type: 'object' };
      relationshipValue = {
        type: 'array',
        items: {
          ...modelProperties,
        },
      };
    } else if (
      isIncludeParentRelationships &&
      value.relation.name === constants.ManyToManyRelation
    ) {
      //protect from endless recursion
      const modelProperties =
        value.modelClass !== fromModelClass
          ? _resolveModelProperties(
              value.modelClass,
              false,
              isIncludeParentRelationships,
              modelPaths
            )
          : { type: 'object' };
      relationshipValue = {
        type: 'array',
        items: {
          ...modelProperties,
        },
      };
    }
    if (relationshipValue) {
      processedSchema.properties[key] = relationshipValue;
    }
  });

  return processedSchema;
}

function _resolveModelProperties(
  modelClass,
  isIncludeRelationships,
  isIncludeParentRelationships,
  modelPaths
) {
  let model;

  if ( _.isString(modelClass)) {
    if (modelPaths && modelPaths.length) {
      for (const modelPath of modelPaths)
        model = require(path.join(process.cwd(), modelPath, modelClass));
    } else {
      model = require(modelClass);
    }
  } else {
    model = modelClass;
  }

  if (isIncludeRelationships && model.relationMappings) {
    return enrichSchemaWithRelationships(
      model.jsonSchema,
      model.relationMappings,
      isIncludeParentRelationships,
      modelClass,
      modelPaths
    );
  }

  return transformSchema(model.jsonSchema, {});
}

module.exports = {
  enrichSchemaWithRelationships,
};
