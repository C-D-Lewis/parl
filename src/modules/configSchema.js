module.exports = {
  additionalProperties: false,
  required: ['resources'],
  properties: {
    resources: {
      type: 'array',
      items: { type: 'string' },
    },
    authorization: {
      type: 'object',
      required: ['type', 'key'],
      properties: {
        type: {
          type: 'string',
          enum: ['header'],
        },
        key: {
          type: 'string',
        },
      },
    },
  },
};
