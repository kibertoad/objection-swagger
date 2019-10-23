const _ = require('lodash');
const Status = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
});

const QUERY_JSON_SCHEMA = Object.freeze({
  title: 'SimpleQuery',
  items: {
    type: 'object',
    properties: {
      statuses: {
        in: 'query',
        description: 'The statuses to retrieve data for',
        type: 'array',
        items: {
          type: 'string',
          enum: _.values(Status),
        },
      },
      updatedAtFrom: {
        in: 'query',
        description: 'The lower bound of the time period',
        type: ['string', 'null'],
        format: 'date-time',
      },
      updatedAtTo: {
        in: 'query',
        description: 'The upper bound of the time period',
        type: ['string', 'null'],
        format: 'date-time',
      },
      assigneeIds: {
        in: 'query',
        description: 'The assignee id to filter by',
        type: 'array',
        items: {
          type: 'integer',
        },
      },
    },
  },
});

module.exports = QUERY_JSON_SCHEMA;
