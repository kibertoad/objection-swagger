const Model = require('objection').Model;

class SimpleModel extends Model {
    static get jsonSchema() {
        return {
			title:  'SimpleModel',
            type: 'object',
            additionalProperties: true,

            properties: {
                intAttr: { type: 'integer' },
                stringAttr: { type: 'string' },
                stringAttrOptional: { type: ['string', 'null'] },
                dateTimeAttr: { type: 'string', format: 'date-time' }
            }
        };
    }


}

module.exports = SimpleModel;
