const ParentModel = require('./models/ParentModel');
const RecursiveParentModel = require('./models/RecursiveParentModel');

const transformers = require('../lib/transformers');

const { assert } = require('chai');

describe('transformers', () => {

	it('enriches schema with relationships', async () => {
		const schema = ParentModel.jsonSchema;
		const relationships = ParentModel.relationMappings;

		const enrichedSchema = transformers.enrichSchemaWithRelationships(schema, relationships);
		assert.deepEqual(enrichedSchema, {
			"additionalProperties": true,
			"properties": {
				"children": {
					"items": {
						"additionalProperties": true,
						"description": "child",
						"properties": {
							"stringAttr": {
								"type": "string"
							},
							"stringAttrOptional": {
								"type": [
									"string",
									"null"
								]
							},
							"stringAttrPrivate": {
								"private": true,
								"type": "string"
							}
						},
						"required": [],
						"title": "ChildModel",
						"type": "object"
					},
					"type": "array"
				},
				"stringAttr": {
					"type": "string"
				},
				"stringAttrPrivate": {
					"private": true,
					"type": "string"
				}
			},
			"required": [],
			"title": "ParentModel",
			"type": "object"
		});
	});

	it('enriches schema with relationships recursively', async () => {
		const schema = RecursiveParentModel.jsonSchema;
		const relationships = RecursiveParentModel.relationMappings;

		const enrichedSchema = transformers.enrichSchemaWithRelationships(schema, relationships);
		assert.deepEqual(enrichedSchema, {
			"additionalProperties": true,
			"properties": {
				"children": {
					"items": {
						"additionalProperties": true,
						"description": "child",
						"properties": {
							"children": {
								"items": {
									"additionalProperties": true,
									"description": "child",
									"properties": {
										"stringAttr": {
											"type": "string"
										},
										"stringAttrOptional": {
											"type": [
												"string",
												"null"
											]
										},
										"stringAttrPrivate": {
											"private": true,
											"type": "string"
										}
									},
									"required": [],
									"title": "ChildModel",
									"type": "object"
								},
								"type": "array"
							},
							"recursiveChildren": {
								"items": {
									"type": "object"
								},
								"type": "array"
							},
							"stringAttr": {
								"type": "string"
							},
							"stringAttrOptional": {
								"type": [
									"string",
									"null"
								]
							},
							"stringAttrPrivate": {
								"private": true,
								"type": "string"
							}
						},
						"required": [],
						"title": "RecursiveChildModel",
						"type": "object"
					},
					"type": "array"
				},
				"stringAttr": {
					"type": "string"
				},
				"stringAttrPrivate": {
					"private": true,
					"type": "string"
				}
			},
			"required": [],
			"title": "RecursiveParentModel",
			"type": "object"
		});
	});

	it('transforms swagger query params into correct JSON Schema', async () => {
		const querySchema = {
			title: 'SampleQuery',
			items: {
				type: 'object',
				properties: {
					statuses: {
						in: 'query',
						description: 'Statuses filter',
						required: true,
						type: 'array', items: {
							type: 'string',
							enum: ['value1', 'value2']
						},
					},
					userId: {
						in: 'query',
						description: 'User ID filter',
						required: false,
						type: 'integer'
					},
					foodId: {
						in: 'query',
						description: 'Food ID filter',
						required: true,
						type: 'integer'
					}
				}
			}
		};

		const result = transformers.fromSwaggerQuerySchema(querySchema);
		assert.deepEqual(result, {
			additionalProperties: false,
			description: undefined,
			properties: {
				foodId: {
					description: 'Food ID filter',
					in: 'query',
					type: 'integer'
				},
				statuses: {
					description: 'Statuses filter',
					in: 'query',
					items: {
						enum: [
							'value1',
							'value2'
						],
						type: 'string'
					},
					type: 'array'
				},
				userId: {
					description: 'User ID filter',
					in: 'query',
					type: 'integer'
				}
			},
			required: [
				'statuses', 'foodId'
			],
			title: 'SampleQuery'
		});
	});
});
