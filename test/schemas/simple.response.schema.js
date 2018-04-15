const SIMPLE_JSON_SCHEMA = Object.freeze({
  title: "SimpleData",
  type: "object",
  required: [],
  additionalProperties: false,

  properties: {
    id: { type: "integer" },
    fieldKey: { type: "string" },
    fieldText: { type: "string" },
    isMandatory: { type: "boolean" },
    isFreeformField: { type: "boolean" }
  }
});

module.exports = SIMPLE_JSON_SCHEMA;
