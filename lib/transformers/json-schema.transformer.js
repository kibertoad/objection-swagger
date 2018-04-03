const _ = require('lodash');

function transformSchema(schema, opts) {
	const processedSchema = _.cloneDeep(schema);
	if (opts.excludeInternalData) {
		delete processedSchema.additionalProperties;
	}
	_processFields(schema, processedSchema);
	return processedSchema;
}

function _processFields(schema, processedSchema) {
	const isFillRequiredList = !processedSchema.required;
	if (!processedSchema.required) {
		processedSchema.required = [];
	}

	_.forOwn(schema.properties, (value, key) => {
		if (value.private) {
			delete processedSchema.properties[key];
		} else {
			//Fill 'required' field field for non-nullable fields
			if (value.type) {
				if (Array.isArray(value.type)) {
					//Swagger 2.0 does not support multiple-value types and neither it does oneOf, so we have to just
					// pick first one
					processedSchema.properties[key].type = value.type[0];
					if (isFillRequiredList && !_propertyIsNullable(value)) {
						processedSchema.required.push(key);
					} else {
						_requiredFieldSanityCheck(key, processedSchema.required.includes(key),
							_propertyIsNullable(value))
					}
				} else {
					if (isFillRequiredList) {
						processedSchema.required.push(key);
					} else {
						_requiredFieldSanityCheck(key, processedSchema.required.includes(key),
							_propertyIsNullable(value))
					}
				}
			}

			//process objects additionally
			if (processedSchema.properties[key] && processedSchema.properties[key].type === 'object') {
				_processFields(value, processedSchema.properties[key])
			}
		}
	});

	//Swagger validation considers empty required attribute to be invalid
	if (processedSchema.required.length === 0) {
		delete processedSchema.required;
	}
}

function _propertyIsNullable(propertyEntry) {
	return Array.isArray(propertyEntry.type) && propertyEntry.type.includes('null');
}

function _requiredFieldSanityCheck(key, isRequired, isNullable) {
	if (isRequired && isNullable) {
		throw new Error(
			`Parameter ${key} is explicitly defined as required and from model it looks like it is nullable. Unable to make decision if field is required.`);
	}
}

module.exports = {
	transformSchema
};
