// Copyright (C) 2020  Aaron Satterlee

import { Arguments } from "yargs";
const tdApiInterface = require ('./tdapiinterface');

/**
 * Gets account info for a single account. You can request additional fields with config.fields as a comma-separated string.
 * Possible values for fields are: positions, orders
 * @param {Object} config - takes accountId, fields (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getAccount = async (config: any) => {
    config.path = `/v1/accounts/${config.accountId}` +
        (config.fields ? `?fields=${config.fields}` : '');

    return tdApiInterface.apiGet(config);
};

/**
 * Gets account info for all linked accounts. You can request additional fields with config.fields as a comma-separated string.
 * Possible values for fields are: positions, orders
 * @param {Object} config - takes fields (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getAccounts = async (config: any) => {
    config.path = `/v1/accounts` +
        (config.fields ? `?fields=${config.fields}` : '');

    return tdApiInterface.apiGet(config);
};

exports.api = {
    getAccount,
    getAccounts
};
exports.command = `accounts <command>`;
exports.desc = 'Get your account info for one or all linked accounts';
exports.builder = (yargs: any) => {
  return yargs
    .command('get <accountId> <fields>',
        'Get <accountId> account info that returns data based on <fields>. Fields is a common-separated string like "positions,orders"',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log('getting account info for account %s with fields %s', argv.accountId, argv.fields);
            }
            return getAccount({
                accountId: argv.accountId,
                fields: argv.fields,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('getall <fields>',
        'Get account info for all connected accounts. Data returned is based on <fields>, a common-separated string like "positions,orders"',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log('getting account info for all linked accounts fields %s', argv.fields);
            }
            return getAccounts({
                fields: argv.fields,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        });
};
exports.handler = (argv: any) => {};
