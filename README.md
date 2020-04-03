# objection-swagger
Originally designed as Swagger definition generator for Objection.js models. Since then scope was extended to also cover Swagger-compatible snippets generation
from plain JSON Schema entries as well as set of conversions that are useful for model and schema definition external consumption.

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]

It is highly recommended to use this library together with express-ajv-swagger-validation, express-swagger-oauth-scopes and swagger-jsdoc in backend
as well as json-schema-to-typescript in the frontend to maximise value from having model definitions as single source of truth.

```
/**
 * @typedef {Object} GeneratedSwaggerYaml
 * @property {string} name Name of the model
 * @property {string} schema JSON schema in YAML format
 */

/**
 * Generates JSON schemas for inclusion in Swagger specifications from Objection.js models
 * @param {Model|Model[]} modelParam - model(s) to generate schemas for
 * @param {Options} opts
 * @returns {GeneratedSwaggerYaml[]} generated JSON schemas as strings (in YAML format)
 */
function generateSchema(modelParam, opts = {})
```

```
/**
 * @typedef {Object} GeneratedSwagger
 * @property {string} name Name of the model
 * @property {Object} schema JSON schema
 */

/**
 * Generates JSON schemas from Objection.js models
 * @param {Model|Model[]} modelParam - model(s) to generate schemas for
 * @param {Options} opts
 * @returns {GeneratedSwagger[]} generated JSON schemas as objects
 */
function generateSchemaRaw(modelParam, opts = {})
```

```
/**
 * Generates and saves into specified directory JSON schema files for inclusion in Swagger specifications from given
 * Objection.js models
 * @param {Model|Model[]} modelParam - model(s) to generate schemas for
 * @param {string} targetDir - directory to write generated schemas to. Do not add '/' to the end.
 * @param {Options} opts
 * @returns {Promise} - promise that is resolved after schemas are written
 */
function saveSchema(modelParam, targetDir, opts = {})
```


```
/**
 * Generates and saves into specified directory JSON-schema YAML files for inclusion in Swagger specifications from given
 * JSON-schemas
 * @param {Object|Object[]} schemaParam - JSON-Schema(s) to generate yamls for. Title param is used as a filename
 * @param {string} targetDir - directory to write generated schemas to. Do not add '/' to the end.
 * @param {Options} opts
 * @returns {Promise} - promise that is resolved after yamls are written
 */
function saveNonModelSchema(schemaParam, targetDir, opts = {})
```

```
/**
 * Generates and saves into specified directory JSON-schema YAML files for inclusion in Swagger query param specifications from
 * given JSON-schemas
 * @param {Object|Object[]} schemaParam - JSON-Schema(s) to generate yamls for. Title param is used as a filename
 * @param {string} targetDir - directory to write generated schemas to. Do not add '/' to the end.
 * @param {Options} opts
 * @returns {Promise} - promise that is resolved after yamls are written
 */
function saveQueryParamSchema(schemaParam, targetDir, opts = {})
```


```
/**
 * Transforms Swagger query params into correct JSON Schema
 * @param {Object} queryModel - Swagger query params model
 * @returns {Object} JSON Schema object
 */
function swaggerQueryParamsToSchema(queryModel) {
```

```
/**
 * Creates copy of provided schema and enriches it with attributes that are derived from relationships
 * @param {Object} schema - JSON Schema
 * @param {Object} relationships - Objection.js relationMappings
 * @param {boolean} isIncludeParentRelationships - whether ManyToManyRelation and BelongsToOneRelation relationships should be included
 * @param {Object} [fromModelClass] - model class from which enrichment was initiated
 * @param {string[]} [modelPaths] - model base paths for loading relations when modelClass is a string
 * @returns {Object} JSON Schema object
 */
function enrichSchemaWithRelationships(schema, relationships, isIncludeParentRelationships, fromModelClass, modelPaths) {
```

[npm-image]: https://img.shields.io/npm/v/objection-swagger.svg
[npm-url]: https://npmjs.org/package/objection-swagger
[downloads-image]: https://img.shields.io/npm/dm/objection-swagger.svg
[downloads-url]: https://npmjs.org/package/objection-swagger
