const Model = require('objection').Model;

class ModelWithPrivateFields extends Model {
    static get jsonSchema() {
        return {
            type: 'object',
            required: [],
            additionalProperties: true,

            properties: {
                stringAttr: { type: 'string' },
				stringAttrPrivate: { type: 'string', private: true }
            }
        };
    }


}

module.exports = ModelWithPrivateFields;
