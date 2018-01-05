class Options {

	/**
	 *
	 * @param {String} [useSuffix]
	 * @param {boolean} [excludeInternalData]
	 * @param {boolean} useEntityRefs
	 */
	constructor(useSuffix, excludeInternalData, useEntityRefs){
		this.useSuffix = useSuffix;
		this.excludeInternalData = excludeInternalData;
		this.useEntityRefs = useEntityRefs;
	}
}

module.exports = Options;

