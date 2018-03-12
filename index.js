const objectionSwagger = require('./lib/objection-swagger');
const Options = require('./lib/Options');

module.exports = {
	generateSchema: objectionSwagger.generateSchema,
	saveNonModelSchema: objectionSwagger.saveNonModelSchema,
	saveSchema: objectionSwagger.saveSchema,
	Options
};
