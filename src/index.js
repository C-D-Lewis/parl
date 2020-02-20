const { readdirSync } = require('fs');
const { validate } = require('jsonschema');

const CONFIG_PREFIX = 'parl-plugin-';
const CONFIG_SCHEMA = {
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

const ARGS = process.argv.slice(2);
const commands = [];

const validateConfig = (name, config) => {
  const results = validate(config, CONFIG_SCHEMA);
  if (results.errors && results.errors.length > 0) {
    throw new Error(`Config is not valid:\n- ${results.errors.map(p => p.stack).join('\n- ')}`);
  }
};

const loadConfigs = () => {
  const configs = readdirSync(`${__dirname}/../../`)
    .filter(p => p.includes(CONFIG_PREFIX))
    .map(p => ({ name: p, data: require(`${__dirname}/../../${p}`) }));
  configs.forEach((config) => {
    validateConfig(config.name, config.data);

    config.data.resources.forEach(resource => commands.push(resource));
  });
};

const argMatches = (arg, spec) => {
  if (arg === spec) return true;
  if (spec === ':id') return true;

  return false;
};

// Find a loaded command path that matches args
const getPath = () =>
  commands.find((command) => {
    const spec = command.split('/').filter(p => p.length);
    return ARGS.every((p, i) => argMatches(p, spec[i]));
  });

const main = () => {
  try {
    loadConfigs();
    const path = getPath();
    
  } catch (e) {
    console.log(e);
  }
};

main();
