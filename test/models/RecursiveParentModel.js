const Model = require('objection').Model;

class RecursiveParentModel extends Model {
	static get jsonSchema() {
		return {
			title:  'RecursiveParentModel',
			type: 'object',
			required: [],
			additionalProperties: true,

			properties: {
				stringAttr: {type: 'string'},
				stringAttrPrivate: {type: 'string', private: true}
			}
		};
	}

	static get relationMappings() {
		return {
			children: {
				relation: Model.HasManyRelation,
                description: 'child entity',
				modelClass: `${__dirname}/RecursiveChildModel`,
				join: {
					from: 'parentModels.id',
					to: 'childModels.parentId'
				}
			}
		};
	}
}

module.exports = RecursiveParentModel;
