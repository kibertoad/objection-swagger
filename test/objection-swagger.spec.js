const assert = require('chai').assert;
const sinon = require('sinon');
const mkdirp = require('mkdirp-promise');
const { promisify } = require('util');
const fs = require('fs');
const unlinkAsync = promisify(fs.unlink);
const yaml = require('js-yaml');

const Options = require('../lib/Options');
const yamlWriter = require('../lib/utils/yaml.writer');
const objectionSwagger = require('../lib/objection-swagger');

const SimpleModel = require('./models/SimpleModel');
const SimpleModelInvalidRequired = require('./models/SimpleModelInvalidRequired');
const SimpleModelNoRequired = require('./models/SimpleModelNoRequired');
const ModelWithPrivateFields = require('./models/ModelWithPrivateFields');
const ParentModel = require('./models/ParentModel');
const NestedModel = require('./models/NestedModel');
const ChildModel = require('./models/ChildModel');
const ParentModelClassReference = require('./models/ParentModelClassReference');
const ParentModelSelfReference = require('./models/ParentModelSelfReference');
const EmptyModel = require('./models/EmptyModel');

const SimpleResponseSchema = require('./schemas/simple.response.schema');

const QueryParamSchema = require('./schemas/simple.query.schema');

const SIMPLE_MODEL_SCHEMA = 'title: SimpleModel\ntype: object\nadditionalProperties: true\nproperties:\n  intAttr:\n    type: integer\n  '
	+ 'stringAttr:\n    type: string\n  stringAttrOptional:\n    type: string\n  dateTimeAttr:\n    type: string\n    format: date-time\n';

const SIMPLE_MODEL_SCHEMA_GENERATED_REQUIRE = 'title: SimpleModel\ntype: object\nadditionalProperties: true\nproperties:\n  intAttr:\n    type: integer\n  stringAttr:\n    type: string\n  stringAttrOptional:\n    type: string\n  dateTimeAttr:\n    type: string\n    format: date-time\nrequired:\n  - intAttr\n  - stringAttr\n  - dateTimeAttr\n';

const SIMPLE_MODEL_SCHEMA_NO_INTERNAL = 'title: SimpleModel\ntype: object\nproperties:\n  intAttr:\n    type: integer\n  '
	+ 'stringAttr:\n    type: string\n  stringAttrOptional:\n    type: string\n  dateTimeAttr:\n    type: string\n    format: date-time\n';

const MODEL_WITH_PRIVATE_FIELDS_SCHEMA = 'title: ModelWithPrivateFields\ntype: object\nadditionalProperties: true\nproperties:\n  stringAttr:\n    type: string\n';

const PARENT_MODEL_SELF_REFERENCE = 'title: ParentModel\ntype: object\nadditionalProperties: true\nproperties:\n  stringAttr:\n    type: string\n  children:\n    type: array\n    items:\n      type: object\n';

describe('objection-swagger', () => {
	beforeEach(() => {
		global.sinon = sinon.sandbox.create();
	});

	afterEach(() => {
		global.sinon.restore();
	});

	describe('generateSchema', () => {
		it('generates model schema yaml from single model', async () => {
			const result = objectionSwagger.generateSchema(SimpleModel);

			assert.lengthOf(result, 1);
			assert.equal(result[0].name, 'SimpleModel');
			assert.equal(result[0].schema, SIMPLE_MODEL_SCHEMA);
		});

		it('fails to generate model schema yaml from single model', async () => {
			assert.throws(() => {
				objectionSwagger.generateSchema(SimpleModelInvalidRequired);
			}, /explicitly defined as required and from model it looks like it is nullable/);
		});

		it('fills required field for a model', async () => {
			const result = objectionSwagger.generateSchema(SimpleModelNoRequired);

			assert.lengthOf(result, 1);
			assert.equal(result[0].name, 'SimpleModel');
			assert.equal(result[0].schema, SIMPLE_MODEL_SCHEMA_GENERATED_REQUIRE);
		});

		it('generates model schema yaml from single model, excludes internal fields', async () => {
			const result = objectionSwagger.generateSchema(SimpleModel, { excludeInternalData: true });

			assert.lengthOf(result, 1);
			assert.equal(result[0].name, 'SimpleModel');
			assert.equal(result[0].schema, SIMPLE_MODEL_SCHEMA_NO_INTERNAL);
		});

		it('generates model schema yaml from array of models', async () => {
			const result = objectionSwagger.generateSchema([SimpleModel]);

			assert.lengthOf(result, 1);
			assert.equal(result[0].name, 'SimpleModel');
			assert.equal(result[0].schema, SIMPLE_MODEL_SCHEMA);
		});

		it('saves model schema yaml', async () => {
			let writeResult;
			const writeStub = global.sinon.stub(yamlWriter, 'writeYamlsToFs').callsFake((writeParams) => {
				writeResult = writeParams;
			});

			const result = objectionSwagger.saveSchema(SimpleModel, 'dummyDir');

			assert.lengthOf(writeResult, 1);
			assert.equal(writeResult[0].name, 'SimpleModel');
			assert.equal(writeResult[0].schema, SIMPLE_MODEL_SCHEMA);
		});

		it('ignores private fields', async () => {
			const result = objectionSwagger.generateSchema(ModelWithPrivateFields);

			assert.lengthOf(result, 1);
			assert.equal(result[0].name, 'ModelWithPrivateFields');
			assert.equal(result[0].schema, MODEL_WITH_PRIVATE_FIELDS_SCHEMA);
		});

		it('generates parent model schema correctly', async () => {
			const result = objectionSwagger.generateSchema(ParentModel);

			assert.lengthOf(result, 1);
			assert.equal(result[0].name, 'ParentModel');
			assert.deepEqual(yaml.load(result[0].schema), {
				"additionalProperties": true,
				"properties": {
					"children": {
						"description": "child entity",
						"items": {
							"additionalProperties": true,
							"description": "child",
							"properties": {
								"stringAttr": {
									"type": "string"
								},
								"stringAttrOptional": {
									"type": "string"
								}
							},
							"title": "ChildModel",
							"type": "object"
						},
						"type": "array"
					},
					"stringAttr": {
						"type": "string"
					}
				},
				"title": "ParentModel",
				"type": "object"
			});
		});

		it('generates nested model schema correctly', async () => {
			const result = objectionSwagger.generateSchema(NestedModel);

			assert.lengthOf(result, 1);
			assert.equal(result[0].name, 'NestedModel');
			assert.deepEqual(yaml.load(result[0].schema), {
				"additionalProperties": false,
				"properties": {
					"mandatoryPreferences": {
						"additionalProperties": false,
						"properties": {
							"mandatoryUser": {
								"type": "integer"
							},
							"substitutedUser": {
								"type": "integer"
							}
						},
						"required": [
							"mandatoryUser"
						],
						"type": "object"
					},
					"preferences": {
						"additionalProperties": false,
						"properties": {
							"substitutedUser": {
								"type": "integer"
							}
						},
						"type": "object"
					}
				},
				"title": "UserPreferencesModel",
				"type": "object"
			});
		});

		it('generates parent model with class reference schema correctly', async () => {
			const result = objectionSwagger.generateSchema(ParentModelClassReference);

			assert.lengthOf(result, 1);
			assert.equal(result[0].name, 'ParentModel');
			assert.deepEqual(yaml.load(result[0].schema), {
				"additionalProperties": true,
				"properties": {
					"children": {
						"description": "child entity",
						"items": {
							"additionalProperties": true,
							"description": "child",
							"properties": {
								"stringAttr": {
									"type": "string"
								},
								"stringAttrOptional": {
									"type": "string"
								}
							},
							"title": "ChildModel",
							"type": "object"
						},
						"type": "array"
					},
					"stringAttr": {
						"type": "string"
					}
				},
				"title": "ParentModel",
				"type": "object"
			});
		});

		it('generates parent model with self reference schema correctly', async () => {
			const result = objectionSwagger.generateSchema(ParentModelSelfReference);

			assert.lengthOf(result, 1);
			assert.equal(result[0].name, 'ParentModel');
			assert.equal(result[0].schema, PARENT_MODEL_SELF_REFERENCE);
		});

		it('generates parent model schema without internal fields correctly', async () => {
			const result = objectionSwagger.generateSchema(ParentModel, { excludeInternalData: true });

			assert.lengthOf(result, 1);
			assert.equal(result[0].name, 'ParentModel');
			assert.deepEqual(yaml.load(result[0].schema), {
				"properties": {
					"children": {
						"description": "child entity",
						"items": {
							"description": "child",
							"properties": {
								"stringAttr": {
									"type": "string"
								},
								"stringAttrOptional": {
									"type": "string"
								}
							},
							"title": "ChildModel",
							"type": "object"
						},
						"type": "array"
					},
					"stringAttr": {
						"type": "string"
					}
				},
				"title": "ParentModel",
				"type": "object"
			});
		});

		it('generates child model schema correctly', async () => {
			const result = objectionSwagger.generateSchema(ChildModel);

			assert.lengthOf(result, 1);
			assert.equal(result[0].name, 'ChildModel');
			assert.deepEqual(yaml.load(result[0].schema), {
				"additionalProperties": true,
				"description": "child",
				"properties": {
					"stringAttr": {
						"type": "string"
					},
					"stringAttrOptional": {
						"type": "string"
					}
				},
				"title": "ChildModel",
				"type": "object"
			});
		});

		it('correctly processes model without schema', async () => {
			const result = objectionSwagger.generateSchema(EmptyModel);
			assert.lengthOf(result, 1);
			assert.equal(result[0].name, 'EmptyModel');
			assert.deepEqual(result[0].schema, '{}\n');
		});
	});

	describe('saveSchema', () => {
		it('saves model schema yaml from single model', async () => {
			await mkdirp('build');
			await objectionSwagger.saveSchema(ParentModel, 'build', { useEntityRefs: true });
			await unlinkAsync('build/ParentModel.yaml');
		});
	});

	describe('saveNonModelSchema', () => {
		it('saves non-model schema yaml from single schema', async () => {
			await mkdirp('build');
			await objectionSwagger.saveNonModelSchema(SimpleResponseSchema, 'build');
			const simpleModelSchema = yaml.load(fs.readFileSync('build/SimpleData.yaml'));
			await unlinkAsync('build/SimpleData.yaml');
			assert.deepEqual(simpleModelSchema,
				{
					title: 'SimpleData',
					type: 'object',
					additionalProperties: false,
					properties: {
						id: {
							'type': 'integer'
						},
						fieldKey: {
							'type': 'string'
						},
						fieldText: {
							'type': 'string'
						},
						isMandatory: {
							'type': 'boolean'
						},
						isFreeformField: {
							'type': 'boolean'
						}
					}
				}
			);
		});
	});

	describe('saveQueryParamSchema', () => {
		it('saves query param schema yaml from single schema', async () => {
			await mkdirp('build');
			await objectionSwagger.saveQueryParamSchema(QueryParamSchema, 'build');
			const simpleModelSchema = yaml.load(fs.readFileSync('build/SimpleQuery.yaml'));
			await unlinkAsync('build/SimpleQuery.yaml');
			assert.deepEqual(simpleModelSchema,
				[
					{
						description: 'The statuses to retrieve data for',
						in: 'query',
						items: {
							'enum': [
								'active',
								'inactive'
							],
							'type': 'string',
						},
						name: 'statuses',
						required: true,
						type: 'array'
					},
					{
						description: 'The lower bound of the time period',
						format: 'date-time',
						in: 'query',
						name: 'updatedAtFrom',
						required: false,
						type: 'string'
					},
					{
						description: 'The upper bound of the time period',
						format: 'date-time',
						in: 'query',
						name: 'updatedAtTo',
						required: false,
						type: 'string'
					},
					{
						description: 'The assignee id to filter by',
						in: 'query',
						items: {
							'type': 'integer'
						},
						name: 'assigneeIds',
						required: true,
						type: 'array'
					}
				]
			);
		});
	});
});
