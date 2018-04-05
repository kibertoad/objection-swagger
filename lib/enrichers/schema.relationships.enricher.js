const Model = require("objection").Model;
const _ = require("lodash");

/**
 * Creates copy of provided schema and enriches it with attributes that are derived from relationships
 * @param {Object} schema - JSON Schema
 * @param {Object} relationships - Objection.js relationMappings
 * @param {boolean} isIncludeParentRelationships - whether ManyToManyRelation and BelongsToOneRelation relationships should be included
 * @param {Object} [fromModelClass] - model class from which enrichment was initiated
 * @returns {Object} JSON Schema object
 */
function enrichSchemaWithRelationships(
  schema,
  relationships,
  isIncludeParentRelationships,
  fromModelClass
) {
  const processedSchema = _.cloneDeep(schema);

  _.forOwn(relationships, (value, key) => {
    let relationshipValue;
    if (value.relation.name === Model.HasOneRelation.name) {
      //protect from endless recursion
      const modelProperties =
        value.modelClass !== fromModelClass
          ? _resolveModelProperties(
              value.modelClass,
              true,
              isIncludeParentRelationships
            )
          : { type: "object" };
      relationshipValue = {
        ...modelProperties
      };
    } else if (
      isIncludeParentRelationships &&
      value.relation.name === Model.BelongsToOneRelation.name
    ) {
      //protect from endless recursion
      const modelProperties =
        value.modelClass !== fromModelClass
          ? _resolveModelProperties(
              value.modelClass,
              false,
              isIncludeParentRelationships
            )
          : { type: "object" };
      relationshipValue = {
        ...modelProperties
      };
    } else if (value.relation.name === Model.HasManyRelation.name) {
      //protect from endless recursion
      const modelProperties =
        value.modelClass !== fromModelClass
          ? _resolveModelProperties(
              value.modelClass,
              true,
              isIncludeParentRelationships
            )
          : { type: "object" };
      relationshipValue = {
        type: "array",
        items: {
          ...modelProperties
        }
      };
    } else if (
      isIncludeParentRelationships &&
      value.relation.name === Model.ManyToManyRelation.name
    ) {
      //protect from endless recursion
      const modelProperties =
        value.modelClass !== fromModelClass
          ? _resolveModelProperties(
              value.modelClass,
              false,
              isIncludeParentRelationships
            )
          : { type: "object" };
      relationshipValue = {
        type: "array",
        items: {
          ...modelProperties
        }
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
  isIncludeParentRelationships
) {
  const model = _.isString(modelClass) ? require(modelClass) : modelClass;

  if (isIncludeRelationships && model.relationMappings) {
    return enrichSchemaWithRelationships(
      model.jsonSchema,
      model.relationMappings,
      isIncludeParentRelationships,
      modelClass
    );
  }
  return model.jsonSchema;
}

module.exports = {
  enrichSchemaWithRelationships
};
