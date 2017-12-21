const _ = require('lodash');
const fs = require('fs');
const {promisify} = require('util');
const writeFileAsync = promisify(fs.writeFile);

function writeAll(entries) {
	return Promise.all(_.map(entries, (entry) => {
		return writeFileAsync(entry.targetFile, entry.data);
	}))
}

module.exports = {
	writeAll
};
