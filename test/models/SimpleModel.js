const Model = require('objection').Model;

class SimpleModel extends Model {
    static get tableName() {
        return 'sources';
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],
            additionalProperties: true,

            properties: {
                intAttr: { type: 'integer' },
                stringAttr: { type: 'string' },
                stringAttrOptional: { type: 'string' },
                dateTimeAttr: { type: 'string', format: 'date-time' }
            }
        };
    }


}

module.exports = SimpleModel;
