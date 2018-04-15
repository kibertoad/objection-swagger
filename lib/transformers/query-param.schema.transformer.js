const _ = require("lodash");

/**
 * Transforms JSON-Schema to be usable as Swagger endpoint query param schema
 * @param {Object} processedSchema
 * @returns {*}
 */
function transformIntoQueryParamSchema(processedSchema) {
  return _.transform(
    processedSchema.items.properties,
    (result, value, key) => {
      const parameter = Object.assign(
        {
          name: key
        },
        value,
        {
          type: Array.isArray(value.type) ? value.type[0] : value.type,
          required: !_.includes(value.type, "null")
        }
      );
      result.push(parameter);
    },
    []
  );
}

module.exports = {
  transformIntoQueryParamSchema
};
