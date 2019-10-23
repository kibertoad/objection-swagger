const Model = require('objection').Model;

class RecursiveChildModel extends Model {
  static get jsonSchema() {
    return {
      title: 'RecursiveChildModel',
      type: 'object',
      description: 'child',
      required: [],
      additionalProperties: true,

      properties: {
        stringAttr: { type: 'string' },
        stringAttrOptional: { type: ['string', 'null'] },
        stringAttrPrivate: { type: 'string', private: true },
      },
    };
  }

  static get relationMappings() {
    return {
      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/RecursiveParentModel`,
        join: {
          from: 'recursiveChildModels.parentId',
          to: 'parentModels.id',
        },
      },
      children: {
        relation: Model.HasManyRelation,
        description: 'child entity',
        modelClass: `${__dirname}/ChildModel`,
        join: {
          from: 'recursiveChildModels.id',
          to: 'childModels.parentId',
        },
      },
      recursiveChildren: {
        relation: Model.HasManyRelation,
        description: 'recursive child entity',
        modelClass: `${__dirname}/RecursiveChildModel`,
        join: {
          from: 'recursiveChildModels.id',
          to: 'recursiveChildModels.parentId',
        },
      },
    };
  }
}

module.exports = RecursiveChildModel;
