const fs = require('fs');
const path = require('path');
const _ = require('lodash');

/**
 * @param {string|Object} modelClass
 * @param {string[]} modelPaths
 * @returns {Object}
 */
function getModelClass(modelClass, modelPaths) {
  if (_.isString(modelClass)) {
    if (modelPaths && modelPaths.length) {
      for (const modelPath of modelPaths) {
        let fullPath = path.join(process.cwd(), modelPath, modelClass);

        if (!fullPath.endsWith('.js') && !fullPath.endsWith('.ts'))
          fullPath += '.js';

        if (fs.existsSync(fullPath))
          return require(fullPath);
      }

      if (!model)
        throw new Error(`Failed to load modelClass ${modelClass} with modelPaths ${JSON.stringify(modelPaths)}`);
    } else {
      return require(modelClass);
    }
  } else {
    return modelClass;
  }
}

module.exports = getModelClass;
