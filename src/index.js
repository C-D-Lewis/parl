const { readdirSync } = require('fs');
const { validate } = require('jsonschema');

const CONFIG_PREFIX = 'parl-plugin-';
const CONFIG_SCHEMA = {
  additionalProperties: false,
  required: ['resources'],
  properties: {
    resources: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'path'],
        properties: {
          name: { type: 'string' },
          path: { type: 'string' },
        },
      },
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

const ARGS = process.argv.slice(2);
const loadedConfig = {};

const validateConfig = (name, config) => {
  const results = validate(config, CONFIG_SCHEMA);
  if (results.errors && results.errors.length > 0) {
    throw new Error(`Config is not valid:\n- ${results.errors.map(p => p.stack).join('\n- ')}`);
  }
};

const loadConfigs = () => {
  const configs = readdirSync(`${__dirname}/../../`)
    .filter(p => p.includes(CONFIG_PREFIX))
    .map((p) => ({ name: p, data: require(`${__dirname}/../../${p}`) }));
  configs.forEach((p) => {
    validateConfig(p.name, p.data);

    // Add resources
    
  });
};

const main = () => {
  try {
    loadConfigs();
  } catch (e) {
    console.log(e);
  }
};

main();
