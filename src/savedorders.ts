// Copyright (C) 2020  Aaron Satterlee

const tdApiInterface = require ('./tdapiinterface');
import { Arguments } from "yargs";

/**
 * Create a saved order for a given account
 * @param {Object} config - takes accountId, orderJSON
 * @returns {Promise<Object>} api POST result
 * @async
 */
const createSavedOrder = async (config: any) => {
    config.bodyJSON = config.orderJSON;
    config.path = `/v1/accounts/${config.accountId}/savedorders`;

    return tdApiInterface.apiPost(config);
};

/**
 * Delete a specified saved order for a given account
 * @param {Object} config - takes accountId, savedOrderId
 * @returns {Promise<Object>} api DELETE result
 * @async
 */
const deleteSavedOrder = async (config: any) => {
    if (!config) config = {};
    config.path = `/v1/accounts/${config.accountId}/savedorders/${config.savedOrderId}`;

    return tdApiInterface.apiDelete(config);
};

/**
 * Get a particular saved order for a given account
 * @param {Object} config - takes accountId, savedOrderId
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getSavedOrderById = async (config: any) => {
    config.path = `/v1/accounts/${config.accountId}/savedorders/${config.savedOrderId}`;

    return tdApiInterface.apiGet(config);
};

/**
 * Get all saved orders for a given account
 * @param {Object} config - takes accountId
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getSavedOrders = async (config: any) => {
    config.path = `/v1/accounts/${config.accountId}/savedorders`;

    return tdApiInterface.apiGet(config);
};

/**
 * Replace an existing saved order for a specified account using the properly formatted orderJSON
 * @param {Object} config - takes accountId, savedOrderId, orderJSON
 * @returns {Promise<Object>} api PUT result
 * @async
 */
const replaceSavedOrder = async (config: any) => {
    config.bodyJSON = config.orderJSON;
    config.path = `/v1/accounts/${config.accountId}/savedorders/${config.savedOrderId}`;

    return tdApiInterface.apiPut(config);
};

exports.api = {
    createSavedOrder,
    deleteSavedOrder,
    getSavedOrderById,
    getSavedOrders,
    replaceSavedOrder
};
exports.command = 'savedorders <command>';
exports.desc = 'Manage your saved orders';
exports.builder = (yargs: any) => {
  return yargs
    .command('create <accountId> <orderJSON>',
        'Create a saved order for a specified <accountId> using the properly formatted <orderJSON> (enclose in quotes, escape inner quotes, e.g. "{\\"orderType\\":\\"MARKET\\"}" )',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`creating a saved order for ${argv.accountId}`);
            }
            return createSavedOrder({
                accountId: argv.accountId,
                orderJSON: (typeof(argv.orderJSON) === 'string' ? JSON.parse(argv.orderJSON) : argv.orderJSON),
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('replace <savedOrderId> <accountId> <orderJSON>',
        'Replace an existing saved order with <savedOrderId> for a specified <accountId> using the properly formatted <orderJSON> (enclose in quotes, escape inner quotes, e.g. "{\\"orderType\\":\\"MARKET\\"}" )',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`replacing saved order ${argv.savedOrderId} for ${argv.accountId}`);
            }
            return replaceSavedOrder({
                accountId: argv.accountId,
                orderJSON: (typeof(argv.orderJSON) === 'string' ? JSON.parse(argv.orderJSON) : argv.orderJSON),
                savedOrderId: argv.savedOrderId,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('get <savedOrderId> <accountId>',
        'Get saved order info for a specified <savedOrderId> for a given <accountId>',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`getting saved order details for order ${argv.savedOrderId} for account ${argv.accountId}`);
            }
            return getSavedOrderById({
                accountId: argv.accountId,
                savedOrderId: argv.savedOrderId,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('delete <savedOrderId> <accountId>',
        'Delete a specified saved order with <savedOrderId> for a given <accountId>',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`deleting saved order ${argv.savedOrderId} for account ${argv.accountId}`);
            }
            return deleteSavedOrder({
                accountId: argv.accountId,
                savedOrderId: argv.savedOrderId,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('getall <accountId>',
        'Get all saved orders for a given <accountId>',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`getting all saved order details account ${argv.accountId}`);
            }
            return getSavedOrders({
                accountId: argv.accountId,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        });
};
exports.handler = (argv: Arguments) => {};
