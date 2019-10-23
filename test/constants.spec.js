const assert = require('chai').assert;
const Model = require('objection').Model;
const constants = require('../lib/constants');

describe('constants', () => {
  it('are in sync with Objection.js', () => {
    assert.equal(
      constants.BelongsToOneRelation,
      Model.BelongsToOneRelation.name
    );
    assert.equal(constants.HasManyRelation, Model.HasManyRelation.name);
    assert.equal(constants.HasOneRelation, Model.HasOneRelation.name);
    assert.equal(
      constants.HasOneThroughRelation,
      Model.HasOneThroughRelation.name
    );
    assert.equal(constants.ManyToManyRelation, Model.ManyToManyRelation.name);
  });
});
