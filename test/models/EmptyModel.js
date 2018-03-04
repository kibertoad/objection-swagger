const Model = require('objection').Model;

class EmptyModel extends Model {
	static get jsonSchema() {
		return null
	}
}

module.exports = EmptyModel;
