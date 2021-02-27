// Copyright (C) 2020  Aaron Satterlee

const tdApiInterface = require ('./tdapiinterface');
import { Arguments } from "yargs";

/**
 * Get user preferences for a given accountId
 * @param {Object} config - takes accountId
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getUserPreferences = async (config: any) => {
    config.path = `/v1/accounts/${config.accountId}/preferences`;

    return tdApiInterface.apiGet(config);
};

/**
 * Get streamer subscription keys for given accountIds as a comma-separated list: 123,345
 * @param {Object} config - takes accountIds
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getStreamerSubKeys = async (config: any) => {
    config.path = `/v1/userprincipals/streamersubscriptionkeys?accountIds=${config.accountIds}`;

    return tdApiInterface.apiGet(config);
};

/**
 * Update user preferences for a given accountId using a preferencesJSON
 * @param {Object} config - takes accountId, preferencesJSON
 * @returns {Promise<Object>} api PUT result
 * @async
 */
const updateUserPreferences = async (config: any) => {
    config.bodyJSON = config.preferencesJSON;
    config.path = `/v1/accounts/${config.accountId}/preferences`;

    return tdApiInterface.apiPut(config);
};

/**
 * Get user info. Return additional fields with the config.fields param, a comma-separated string of up to 4 fields: streamerSubscriptionKeys, streamerConnectionInfo, preferences, surrogateIds
 * @param {Object} config - fields
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getUserPrincipals = async (config: any) => {
    config.path = `/v1/userprincipals?fields=${config.fields}`;

    return tdApiInterface.apiGet(config);
};

exports.api = {
    getUserPreferences,
    getStreamerSubKeys,
    getUserPrincipals,
    updateUserPreferences
};
exports.command = 'userinfo <command>';
exports.desc = 'Get and update user information such as preferences and keys';
exports.builder = (yargs: any) => {
  return yargs
    .command('principals [fields]',
        'Get user info. Return additional fields with the [fields] param, a comma-separated string of up to 4 fields: streamerSubscriptionKeys, streamerConnectionInfo, preferences, surrogateIds',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`getting principal data with extra fields: ${argv.fields || ''}`);
            }
            return getUserPrincipals({
                fields: argv.fields || '',
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('pref <accountId>',
        'Get user preferences for a given <accountid>',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`getting user preferences for account ${argv.accountId}`);
            }
            return getUserPreferences({
                accountId: argv.accountId,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('streamerkeys <accountIds>',
        'Get streamer subscription keys for given <accountids> as a comma-separated list: 123,345',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`getting streamer sub keys for accounts ${argv.accountIds}`);
            }
            return getStreamerSubKeys({
                accountIds: argv.accountIds,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('updateprefs <accountId> <preferencesJSON>',
        'Update user preferences for a given <accountid> using <preferencesJSON> (on command line, enclose JSON in quotes, escape inner quotes, e.g. "{\\"prop1\\":\\"abc\\"}" )',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`updating preferences for account ${argv.accountId}`);
            }
            return updateUserPreferences({
                accountId: argv.accountId,
                preferencesJSON: (typeof (argv.preferencesJSON) === 'string' ? JSON.parse(argv.preferencesJSON) : argv.preferencesJSON),
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        });

};
exports.handler = (argv: Arguments) => {};
