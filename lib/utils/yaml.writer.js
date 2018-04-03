const _ = require('lodash');
const fs = require('fs');
const {promisify} = require('util');
const writeFileAsync = promisify(fs.writeFile);

/**
 * @param {GeneratedSwaggerYaml[]} yamlSchemaContainers
 * @param {string} targetDir
 * @param {Options} [opts]
 * @returns {Promise<void>}
 */
function writeYamlsToFs(yamlSchemaContainers, targetDir, opts = {}) {
	const writeEntries = yamlSchemaContainers.map((yamlSchemaContainer) => {
			const suffix = opts.useSuffix || '';
			return {
				targetFile: `${targetDir}/${yamlSchemaContainer.name}${suffix}.yaml`,
				data: yamlSchemaContainer.schema
			}
		}
	);
	return _writeAllAsync(writeEntries);
}

function _writeAllAsync(entries) {
	return Promise.all(entries.map((entry) => {
		return writeFileAsync(entry.targetFile, entry.data);
	}))
}

module.exports = {
	writeYamlsToFs
};
