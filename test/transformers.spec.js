const transformers = require('../lib/transformers');

const { assert } = require('chai');

describe('objection-swagger', () => {
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
