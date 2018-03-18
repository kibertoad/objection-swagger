const objectionSwagger = require('./lib/objection-swagger');
const Options = require('./lib/Options');

module.exports = {
	generateSchema: objectionSwagger.generateSchema,
	saveNonModelSchema: objectionSwagger.saveNonModelSchema,
	saveQueryParamSchema : objectionSwagger.saveQueryParamSchema,
	saveSchema: objectionSwagger.saveSchema,
	Options
};
