// Copyright (C) 2020  Aaron Satterlee

import { Arguments } from "yargs";

/**
 * Create a new watchlist for a specified accountId using watchlistJSON
 * @param {Object} config - takes accountId, watchlistJSON
 * @returns {Promise<Object>} api PATCH result
 * @async
 */
const createWatchlist = async (config: any) => {
    config.bodyJSON = config.watchlistJSON;
    config.path = `/v1/accounts/${config.accountId}/watchlists`;

    return tdApiInterface.apiPost(config);
};

/**
 * Delete a single watchlist having watchlistId for a specified accountId
 * @param {Object} config - takes accountId, watchlistId
 * @returns {Promise<Object>} api DELETE result
 * @async
 */
const deleteWatchlist = async (config: any) => {
    config.path = `/v1/accounts/${config.accountId}/watchlists/${config.watchlistId}`;

    return tdApiInterface.apiDelete(config);
};

/**
 * Get a single watchlist having watchlistId for a specified accountId
 * @param {Object} config - takes accountId, watchlistId
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getWatchlist = async (config: any) => {
    config.path = `/v1/accounts/${config.accountId}/watchlists/${config.watchlistId}`;

    return tdApiInterface.apiGet(config);
};


/**
 * Get all watchlists for all linked accounts
 * @param {Object} config - (no input required)
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getWatchlistsMultiAcct = async (config: any) => {
    if (!config) config = {};
    config.path = `/v1/accounts/watchlists`;

    return tdApiInterface.apiGet(config);
};


/**
 * Get all watchlists for a single account with specified accountId
 * @param {Object} config - takes accountId
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getWatchlistsSingleAcct = async (config: any) => {
    config.path = `/v1/accounts/${config.accountId}/watchlists`;

    return tdApiInterface.apiGet(config);
};


/**
 * Replace an entire watchlist having watchlistId for a specified accountId using watchlistJSON
 * @param {Object} config - takes accountId, watchlistId, watchlistJSON
 * @returns {Promise<Object>} api PUT result
 * @async
 */
const replaceWatchlist = async (config: any) => {
    config.bodyJSON = config.watchlistJSON;
    config.path = `/v1/accounts/${config.accountId}/watchlists/${config.watchlistId}`;

    return tdApiInterface.apiPut(config);
};


/**
 * Append/update in place a watchlist having watchlistId for a specified accountId using watchlistJSON
 * @param {Object} config - takes accountId, watchlistId, watchlistJSON
 * @returns {Promise<Object>} api PATCH result
 * @async
 */
const updateWatchlist = async (config: any) => {
    config.bodyJSON = config.watchlistJSON;
    config.path = `/v1/accounts/${config.accountId}/watchlists/${config.watchlistId}`;

    return tdApiInterface.apiPatch(config);
};

exports.api = {
    createWatchlist,
    deleteWatchlist,
    getWatchlist,
    getWatchlistsSingleAcct,
    getWatchlistsMultiAcct,
    replaceWatchlist,
    updateWatchlist
};
exports.command = 'watchlists <command>';
exports.desc = 'Manage your watchlists';
exports.builder = (yargs: any) => {
  return yargs
    .command('create <accountId> <orderJSON>',
        'Create a watchlist for a specified <accountId> using the properly formatted <watchlistJSON> (on command line, enclose JSON in quotes, escape inner quotes, e.g. "{\\"prop1\\":\\"abc\\"}" )',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`creating a watchlist for ${argv.accountId}`);
            }
            return createWatchlist({
                accountId: argv.accountId,
                watchlistJSON: (typeof(argv.watchlistJSON) === 'string' ? JSON.parse(argv.watchlistJSON) : argv.watchlistJSON),
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('replace <watchlistId> <accountId> <watchlistJSON>',
        'Replace an entire watchlist having <watchlistId> for a specified <accountId> using the properly formatted <watchlistJSON> (on command line, enclose JSON in quotes, escape inner quotes, e.g. "{\\"prop1\\":\\"abc\\"}" )',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`replacing watchlist ${argv.watchlistId} for ${argv.accountId}`);
            }
            return replaceWatchlist({
                accountId: argv.accountId,
                watchlistJSON: (typeof(argv.watchlistJSON) === 'string' ? JSON.parse(argv.watchlistJSON) : argv.watchlistJSON),
                watchlistId: argv.watchlistId,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('update <watchlistId> <accountId> <watchlistJSON>',
        'Append/update in place a watchlist having <watchlistId> for a specified <accountId> using the properly formatted <watchlistJSON> (on command line, enclose JSON in quotes, escape inner quotes, e.g. "{\\"prop1\\":\\"abc\\"}" )',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`updating watchlist ${argv.watchlistId} for ${argv.accountId}`);
            }
            return updateWatchlist({
                accountId: argv.accountId,
                watchlistJSON: (typeof(argv.watchlistJSON) === 'string' ? JSON.parse(argv.watchlistJSON) : argv.watchlistJSON),
                watchlistId: argv.watchlistId,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('get <watchlistId> <accountId>',
        'Get a single watchlist having <watchlistId> for a given <accountId>',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`getting watchlist ${argv.watchlistId} for account ${argv.accountId}`);
            }
            return getWatchlist({
                accountId: argv.accountId,
                watchlistId: argv.watchlistId,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('getall <accountId>',
        'Get all watchlists for a given <accountId>',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`getting all watchlists for account ${argv.accountId}`);
            }
            return getWatchlistsSingleAcct({
                accountId: argv.accountId,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('getmulti',
        'Get all watchlists for all your linked accounts',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`getting all watchlists for all linked accounts`);
            }
            return getWatchlistsMultiAcct({
                verbose: argv.verbose || false
            })
            .then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('delete <watchlistId> <accountId>',
        'Delete a specified watchlist with <watchlistId> for a given <accountId>',
        {},
        async (argv: Arguments) => {
            if (argv.verbose) {
                console.log(`deleting watchlist ${argv.watchlistId} for account ${argv.accountId}`);
            }
            return deleteWatchlist({
                accountId: argv.accountId,
                watchlistId: argv.watchlistId,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        });
};
exports.handler = (argv: Arguments) => {};
