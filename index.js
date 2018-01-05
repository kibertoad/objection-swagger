const objectionSwagger = require('./lib/objection-swagger');
const Options = require('./lib/Options');

module.exports = {
	generateSchema: objectionSwagger.generateSchema,
	processSchema: objectionSwagger.saveSchema,
	Options
};
