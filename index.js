const objectionSwagger = require('./lib/objection-swagger');
const schemaRelationshipsEnricher = require('./lib/enrichers/schema.relationships.enricher');
const queryParamsToJsonSchemaConverter = require('./lib/converters/query-params-to-json-schema.converter');
const Options = require('./lib/Options');

module.exports = {
  generateSchema: objectionSwagger.generateSchema,
  generateSchemaRaw: objectionSwagger.generateSchemaRaw,
  saveNonModelSchema: objectionSwagger.saveNonModelSchema,
  saveQueryParamSchema: objectionSwagger.saveQueryParamSchema,
  saveSchema: objectionSwagger.saveSchema,
  enrichSchemaWithRelationships:
    schemaRelationshipsEnricher.enrichSchemaWithRelationships,
  swaggerQueryParamsToSchema:
    queryParamsToJsonSchemaConverter.swaggerQueryParamsToSchema,
  Options,
};
