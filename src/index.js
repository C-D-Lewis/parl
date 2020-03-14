const { getOperation } = require('./modules/parser');

/** Program arguments */
const ARGS = process.argv.slice(2);

/**
 * The main function.
 */
const main = () => {
  try {
    if (ARGS.length < 1) {
      throw new Error('No arguments provided');
    }

    const operation = getOperation();
    console.log(operation);
  } catch (e) {
    console.log(e);
  }
};

main();
