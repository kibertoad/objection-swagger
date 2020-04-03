const Model = require('objection').Model;

class ParentModelWithModelPaths extends Model {
  static get modelPaths() {
    return ['not-exist', './test/models']
  }

  static get jsonSchema() {
    return {
      title: 'ParentModelWithModelPaths',
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
        description: 'child entity',
        modelClass: 'ChildModel',
        join: {
          from: 'parentModels.id',
          to: 'childModels.parentId',
        },
      },
    };
  }
}

module.exports = ParentModelWithModelPaths;
