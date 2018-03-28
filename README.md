# objection-swagger
Swagger definition generator for Objection.js models

```
/**
 * @typedef {Object} GeneratedSwaggerYaml
 * @property {string} name Name of the model
 * @property {string} schema JSON schema in YAML format
 */

/**
 * Generates JSON schemas for inclusion in Swagger specifications from Objection.js models
 * @param {Model|Model[]} modelParam - model(s) to generate schemas for
 * @returns {GeneratedSwaggerYaml[]} generated JSON schemas in YAML format
 */
function generateSchema(modelParam)
```

```
/**
 * Generates and saves into specified directory JSON schema files for inclusion in Swagger specifications from given
 * Objection.js models
 * @param {Model|Model[]} modelParam - model(s) to generate schemas for
 * @param [string] targetDir - directory to write generated schemas to. Do not add '/' to the end.
 * @returns {Promise} - promise that is resolved after schemas are written
 */
function saveSchema(modelParam, targetDir)
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
transformers.fromSwaggerQuerySchema(queryModel)
```

```
/**
 * Creates copy of provided schema and enriches it with attributes that are derived from relationships
 * @param {Object} schema - JSON Schema
 * @param {Object} relationships - Objection.js relationMappings
 * @returns {Object} JSON Schema object
 */
transformers.enrichSchemaWithRelationships(schema, relationships)
```
