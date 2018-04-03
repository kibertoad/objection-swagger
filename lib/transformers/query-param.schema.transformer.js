const _ = require('lodash');

function transformIntoQueryParamSchema(processedSchema) {
	const parameters = [];
	_.forOwn(processedSchema.items.properties, (value, key) => {
		parameters.push({
			name: key,
			...value,
			type: Array.isArray(value.type) ? value.type[0] : value.type,
			required: !_.includes(value.type, 'null')
		})
	});

	return parameters;
}

module.exports = {
	transformIntoQueryParamSchema
};
