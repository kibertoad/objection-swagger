const ParentModel = require('../models/ParentModel');
const RecursiveParentModel = require('../models/RecursiveParentModel');

const enricher = require('../../lib/enrichers/schema.relationships.enricher');

const { assert } = require('chai');

describe('schema-relationships.enricher', () => {
	it('enriches schema with relationships', async () => {
		const schema = ParentModel.jsonSchema;
		const relationships = ParentModel.relationMappings;

		const enrichedSchema = enricher.enrichSchemaWithRelationships(schema, relationships, true);
		assert.deepEqual(enrichedSchema, {
			"additionalProperties": true,
			"properties": {
				"children": {
					"items": {
						"additionalProperties": true,
						"description": "child",
						"properties": {
							"parent": {
								"additionalProperties": true,
								"properties": {
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

	it('enriches schema with relationships without parent relationships', async () => {
		const schema = ParentModel.jsonSchema;
		const relationships = ParentModel.relationMappings;

		const enrichedSchema = enricher.enrichSchemaWithRelationships(schema, relationships, false);
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

		const enrichedSchema = enricher.enrichSchemaWithRelationships(schema, relationships, true);
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
										"parent": {
											"additionalProperties": true,
											"properties": {
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
									"title": "ChildModel",
									"type": "object"
								},
								"type": "array"
							},
							"parent": {
								"additionalProperties": true,
								"properties": {
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
});
