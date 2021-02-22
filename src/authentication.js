// Copyright (C) 2020  Aaron Satterlee

const tdApiInterface = require('./tdapiinterface');


/**
 * Use this to force the refresh of the access_token, regardless if it is expired or not
 * @param {Object} auth_config - optional, meant to be existing local auth data
 * @param {Object} config - optional: verbose
 * @returns {Object} auth info object with some calculated fields, including the all-important access_token; this is written to the auth json file in project's config/
 * @async
 */
const refreshAuthentication = async (auth_config, config) => {
    return tdApiInterface.refreshAuthentication(auth_config, config);
};

/**
 * Use this to get authentication info. Will serve up local copy if not yet expired.
 * @param {Object} config - optional: verbose
 * @returns {Object} auth info object, including the all-important access_token
 * @async
 */
const getAuthentication = async (config) => {
    return tdApiInterface.getAuthentication(config);
};

exports.api = {
    getAuthentication,
    refreshAuthentication
};
exports.command = 'auth <command>';
exports.desc = 'Perform some authentication operations';
exports.builder = (yargs) => {
  return yargs
    .command('get',
        'Gets the current authentication data that is locally stored, and refreshes the access_token if expired',
        {},
        async (argv) => {
            if (argv.verbose) {
                console.log(`getting local auth data`);
            }
            return getAuthentication({verbose: argv.verbose || false}).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('refresh',
        'Forces a refresh of the access_token and returns the current authentication data that is locally stored',
        {},
        async (argv) => {
            if (argv.verbose) {
                console.log(`forcing auth refresh and getting local auth data`);
            }
            return refreshAuthentication({}, {verbose: argv.verbose || false}).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        });
};
exports.handler = (argv) => {};
