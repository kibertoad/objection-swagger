const assert = require('chai').assert;
const sinon = require('sinon');

const fileWriter = require('../lib/file-writer');
const objectionSwagger = require('../lib/objection-swagger');
const SimpleModel = require('./models/SimpleModel');

const SIMPLE_MODEL_SCHEMA = 'type: object\nrequired: []\nadditionalProperties: true\nproperties:\n  intAttr:\n    type: integer\n  stringAttr:\n' +
    '    type: string\n  stringAttrOptional:\n    type: string\n  dateTimeAttr:\n    type: string\n    format: date-time\n';

describe('objection-swagger', () => {
    beforeEach(() => {
        global.sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        global.sandbox.restore();
    });

    it('generates model yaml from single model', async () => {
        const result = objectionSwagger.generateSwagger(SimpleModel);

        assert.lengthOf(result, 1);
        assert.equal(result[0].name, 'SimpleModel');
        assert.equal(result[0].schema, SIMPLE_MODEL_SCHEMA);
    });

    it('generates model yaml from array of models', async () => {
        const result = objectionSwagger.generateSwagger([SimpleModel]);

        assert.lengthOf(result, 1);
        assert.equal(result[0].name, 'SimpleModel');
        assert.equal(result[0].schema, SIMPLE_MODEL_SCHEMA);
    });

    it('saves model yaml', async () => {
        let writeResult;
        const writeStub = sinon.stub(fileWriter, 'writeAll').callsFake((writeParams) => {
            writeResult = writeParams;
        });

        const result = objectionSwagger.saveSwagger(SimpleModel, 'dummyDir');

        assert.lengthOf(writeResult, 1);
        assert.equal(writeResult[0].targetFile, 'dummyDir/SimpleModel.yaml');
        assert.equal(writeResult[0].data, SIMPLE_MODEL_SCHEMA);
    });

});