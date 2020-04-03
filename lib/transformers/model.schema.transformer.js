const _ = require('lodash');
const getModelClass = require('../utils/get-model-class');
const constants = require('../constants');

const jsonSchemaTransformer = require('./json-schema.transformer');

/**
 *
 * @param {Object} model - Objection model
 * @param {Options} opts
 * @returns {*}
 */
function transformJsonSchemaFromModel(model, opts) {
  const schema = model.jsonSchema ? model.jsonSchema : undefined;
  if (!schema) {
    return {};
  }

  const processedSchema = jsonSchemaTransformer.transformSchema(schema, opts);
  _fillRelationshipFields(model, processedSchema, opts);
  return processedSchema;
}

/**
 *
 * @param model
 * @param processedSchema
 * @param {Options} opts
 */
function _fillRelationshipFields(model, processedSchema, opts) {
  _.forOwn(model.relationMappings, (relationEntry, key) => {
    if (constants.HasOneRelation === relationEntry.relation.name) {
      processedSchema.properties[key] = _resolveSchemaForRelation(
        model,
        relationEntry,
        opts
      );
      _addDescription(processedSchema, key, relationEntry);
    } else if (constants.HasManyRelation === relationEntry.relation.name) {
      const items = _resolveSchemaForRelation(model, relationEntry, opts);
      processedSchema.properties[key] = {
        type: 'array',
        items,
      };
      _addDescription(processedSchema, key, relationEntry);
    }
  });
}

function _resolveSchemaForRelation(processedClass, relationEntry, opts) {
  const relatedClass = getModelClass(relationEntry.modelClass, processedClass.modelPaths);
  let result;

  //protect against endless recurstion
  if (processedClass !== relatedClass) {
    result = opts.useEntityRefs
      ? _getRefForModel(relatedClass)
      : transformJsonSchemaFromModel(relatedClass, opts);
  } else {
    result = {
      type: 'object',
    };
  }
  return result;
}

function _getRefForModel(model) {
  return `$ref: ${model.name}.yaml`;
}

function _addDescription(processedSchema, key, relationEntry) {
  if (relationEntry.description) {
    processedSchema.properties[key].description = relationEntry.description;
  }
}

module.exports = {
  transformJsonSchemaFromModel,
};
