const relationshipsEnricher = require("../enrichers/schema.relationships.enricher");
const _ = require("lodash");

/**
 * Transforms Swagger query params into correct JSON Schema
 * @param {Object} queryModel - Swagger query params model
 * @returns {Object} JSON Schema object
 */
function swaggerQueryParamsToSchema(queryModel) {
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
  };
}

module.exports = {
  swaggerQueryParamsToSchema
};
