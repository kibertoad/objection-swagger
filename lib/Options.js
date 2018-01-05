class Options {

	/**
	 *
	 * @param {String} [useSuffix]
	 * @param {boolean} [excludeInternalData]
	 */
	constructor(useSuffix, excludeInternalData){
		this.useSuffix = useSuffix;
		this.excludeInternalData = excludeInternalData;
	}
}

module.exports = Options;

