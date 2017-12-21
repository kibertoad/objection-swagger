const Model = require('objection').Model;

class ChildModel extends Model {
	static get jsonSchema() {
		return {
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
			parent: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname}/ParentModel`,
				join: {
					from: 'childModels.parentId',
					to: 'parentModels.id'
				}
			}
		};
	}
}

module.exports = ChildModel;
