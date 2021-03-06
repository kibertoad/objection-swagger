const Model = require('objection').Model;

class ParentModel extends Model {
  static get jsonSchema() {
    return {
      title: 'ParentModel',
      type: 'object',
      required: [],
      additionalProperties: true,

      properties: {
        stringAttr: { type: 'string' },
        stringAttrPrivate: { type: 'string', private: true },
      },
    };
  }

  static get relationMappings() {
    return {
      children: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/ParentModelSelfReference`,
        join: {
          from: 'parentModels.id',
          to: 'childModels.parentId',
        },
      },
    };
  }
}

module.exports = ParentModel;
