const assert = require('chai').assert;
const sinon = require('sinon');

const Options = require('../lib/Options');
const fileWriter = require('../lib/file-writer');
const objectionSwagger = require('../lib/objection-swagger');
const SimpleModel = require('./models/SimpleModel');
const ModelWithPrivateFields = require('./models/ModelWithPrivateFields');
const ParentModel = require('./models/ParentModel');
const ChildModel = require('./models/ChildModel');

const SIMPLE_MODEL_SCHEMA = 'title: SimpleModel\ntype: object\nadditionalProperties: true\nproperties:\n  intAttr:\n    type: integer\n  '
	+ 'stringAttr:\n    type: string\n  stringAttrOptional:\n    type: string\n  dateTimeAttr:\n    type: string\n    format: date-time\n';

const SIMPLE_MODEL_SCHEMA_NO_INTERNAL = 'title: SimpleModel\ntype: object\nproperties:\n  intAttr:\n    type: integer\n  '
	+ 'stringAttr:\n    type: string\n  stringAttrOptional:\n    type: string\n  dateTimeAttr:\n    type: string\n    format: date-time\n';

const MODEL_WITH_PRIVATE_FIELDS_SCHEMA = 'title: ModelWithPrivateFields\ntype: object\nadditionalProperties: true\nproperties:\n  stringAttr:\n    type: string\n';

const PARENT_MODEL = 'title: ParentModel\ntype: object\nadditionalProperties: true\nproperties:\n  stringAttr:\n    type: string\n  children:\n    type: array\n    items:\n      title: ChildModel\n      type: object\n      additionalProperties: true\n      properties:\n        stringAttr:\n          type: string\n';
const CHILD_MODEL = 'title: ChildModel\ntype: object\nadditionalProperties: true\nproperties:\n  stringAttr:\n    type: string\n';

describe('objection-swagger', () => {
	beforeEach(() => {
		global.sandbox = sinon.sandbox.create();
	});

	afterEach(() => {
		global.sandbox.restore();
	});

	it('generates model schema yaml from single model', async () => {
		const result = objectionSwagger.generateSchema(SimpleModel);

		assert.lengthOf(result, 1);
		assert.equal(result[0].name, 'SimpleModel');
		assert.equal(result[0].schema, SIMPLE_MODEL_SCHEMA);
	});

	it('generates model schema yaml from single model, excludes internal fields', async () => {
		const result = objectionSwagger.generateSchema(SimpleModel, { excludeInternalData: true });

		assert.lengthOf(result, 1);
		assert.equal(result[0].name, 'SimpleModel');
		assert.equal(result[0].schema, SIMPLE_MODEL_SCHEMA_NO_INTERNAL);
	});

	it('generates model schema yaml from array of models', async () => {
		const result = objectionSwagger.generateSchema([SimpleModel]);

		assert.lengthOf(result, 1);
		assert.equal(result[0].name, 'SimpleModel');
		assert.equal(result[0].schema, SIMPLE_MODEL_SCHEMA);
	});

	it('saves model schema yaml', async () => {
		let writeResult;
		const writeStub = sinon.stub(fileWriter, 'writeAll').callsFake((writeParams) => {
			writeResult = writeParams;
		});

		const result = objectionSwagger.saveSchema(SimpleModel, 'dummyDir');

		assert.lengthOf(writeResult, 1);
		assert.equal(writeResult[0].targetFile, 'dummyDir/SimpleModel.yaml');
		assert.equal(writeResult[0].data, SIMPLE_MODEL_SCHEMA);
	});

	it('ignores private fields', async () => {
		const result = objectionSwagger.generateSchema(ModelWithPrivateFields);

		assert.lengthOf(result, 1);
		assert.equal(result[0].name, 'ModelWithPrivateFields');
		assert.equal(result[0].schema, MODEL_WITH_PRIVATE_FIELDS_SCHEMA);
	});

	it('generates parent model schema correctly', async () => {
		const result = objectionSwagger.generateSchema(ParentModel);

		assert.lengthOf(result, 1);
		assert.equal(result[0].name, 'ParentModel');
		assert.equal(result[0].schema, PARENT_MODEL);
	});

	it('generates child model schema correctly', async () => {
		const result = objectionSwagger.generateSchema(ChildModel);

		assert.lengthOf(result, 1);
		assert.equal(result[0].name, 'ChildModel');
		assert.equal(result[0].schema, CHILD_MODEL);
	});
});
