const Model = require('objection').Model;

class NestedModel extends Model {
	static get jsonSchema() {
		return {
			title: 'UserPreferencesModel',
			type: 'object',
			required: [],
			additionalProperties: false,

			properties: {
				preferences: {
					type: ['object', 'null'],
					additionalProperties: false,
					properties: {
						substitutedUser: { type: ['integer', 'null'] }
					}
				},
				mandatoryPreferences: {
					type: 'object',
					additionalProperties: false,
					properties: {
						substitutedUser: { type: ['integer', 'null'] },
						mandatoryUser: { type: ['integer'] }
					}
				}
			}
		};
	}
}

module.exports = NestedModel;
