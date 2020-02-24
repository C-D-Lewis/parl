const { readdirSync } = require('fs');
const { validate } = require('jsonschema');
const configSchema = require('./modules/configSchema');

/** Schema loaded configs must match. */
const CONFIG_PREFIX = 'parl-plugin-';
/** Program arguments */
const ARGS = process.argv.slice(2);

/**
 * Validaet a config against the schema.
 *
 * @param {string} name - Config name.
 * @param {Object} config - Config data.
 * @throws if the config does not match.
 */
const validateConfig = (name, config) => {
  const results = validate(config, configSchema);
  if (results.errors && results.errors.length > 0) {
    throw new Error(`Config is not valid:\n- ${results.errors.map(p => p.stack).join('\n- ')}`);
  }
};

/**
 * Load all configs in the local/global npm directory based on the prefix.
 *
 * @returns {string[]} List of resource paths.
 */
const loadConfigResources = () => {
  const configs = readdirSync(`${__dirname}/../../`)
    .filter(p => p.includes(CONFIG_PREFIX))
    .map(p => ({ name: p, data: require(`${__dirname}/../../${p}`) }));
  return configs.reduce((acc, config) => {
    validateConfig(config.name, config.data);

    return acc.concat(...config.data.resources);
  }, []);
};

/**
 * Check if a given arg token matches a given positional spec.
 *
 * @param {string} token - Space-separated token from the arg list.
 * @param {string} spec - Spec to compare with.
 * @returns {boolean} true if the token matches the spec, false otherwise.
 */
const argMatches = (token, spec) => {
  // Exact match
  if (token === spec) return true;
  // Anything can be an ID
  if (spec === ':id') return true;

  // No reason to match
  return false;
};

/**
* Find a loaded resource path that matches args (inc. placeholders)
*
* @param {Object[]} resources - Loaded resource list.
* @returns {string} Matching resource path.
*/
const getPath = (resources) =>
  resources.find((resource) => {
    const spec = resource.split('/').filter(p => p.length);
    return ARGS.every((p, i) => argMatches(p, spec[i]));
  });

/**
 * Infer the REST method from the argument list.
 *
 * @returns {string} Inferred method.
 */
const getMethod = () => {
  if (ARGS.includes('create')) return 'post';
  if (ARGS.includes('read')) return 'get';
  if (ARGS.includes('update')) return 'put';
  if (ARGS.includes('delete')) return 'delete';

  // If nothing else, read a list
  return 'list';
};

/**
 * The main function.
 */
const main = () => {
  try {
    const resources = loadConfigResources();
    const path = getPath(resources);
    const method = getMethod(path);

    console.log({ path, method });
  } catch (e) {
    console.log(e);
  }
};

main();
