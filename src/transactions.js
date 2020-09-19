// Copyright (C) 2020  Aaron Satterlee

const tdApiInterface = require('./tdapiinterface');

/**
 * Enum for the transaction types
 * @enum
 */
const TRANSACTION_TYPE = {
    ALL: 'ALL',
    TRADE: 'TRADE',
    BUY_ONLY: 'BUY_ONLY',
    SELL_ONLY: 'SELL_ONLY',
    CASH_IN_OR_CASH_OUT: 'CASH_IN_OR_CASH_OUT',
    CHECKING: 'CHECKING',
    DIVIDEND: 'DIVIDEND',
    INTEREST: 'INTEREST',
    OTHER: 'OTHER',
    ADVISOR_FEES: 'ADVISOR_FEES'
};

/**
 * Gets all transactions for a specific account with the set options, such as symbol, type, startDate (yyyy-MM-dd), endDate (yyyy-MM-dd) (maximum time span is 1 year)
 * @param {Object} config - takes accountId, and optionally: type (ENUM is TRANSACTION_TYPE), startDate (yyyy-MM-dd), endDate (yyyy-MM-dd)
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getTransactions = async (config) => {
    config.path = `/v1/accounts/${config.accountId}/transactions?` +
        (config.type ? `type=${config.type}&` : '') +
        (config.startDate ? `startDate=${config.startDate}&` : '') +
        (config.endDate ? `endDate=${config.endDate}&` : '') +
        (config.symbol ? `symbol=${config.symbol}` : '');

    return tdApiInterface.apiGet(config);
};

/**
 * Get a sepcific transaction for a specified account
 * @param {Object} config - takes accountId, transactionId
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getTransaction = async (config) => {
    config.path = `/v1/accounts/${config.accountId}/transactions/${config.transactionId}`;

    return tdApiInterface.apiGet(config);
};

exports.api = {
    getTransaction,
    getTransactions,
    TRANSACTION_TYPE
};
exports.command = 'trans <command>';
exports.desc = 'Retrieve transaction history';
exports.builder = (yargs) => {
  return yargs
    .command('get <transactionId> <accountId>',
        'Get a specific transaction by <transactionId> for a specific <accountId>',
        {},
        async (argv) => {
            if (argv.verbose) {
                console.log(`getting transaction ${argv.transactionId} for ${argv.accountId}`);
            }
            return getTransaction({
                accountId: argv.accountId,
                transactionId: argv.transactionId,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('getall <accountId>',
        'Get all transactions for a specific <accountId> and with the set options, such as type, from, to, symbol',
        {
            type: {
                type: 'string',
                choices: Object.keys(TRANSACTION_TYPE)
            },
            from: {
                type: 'string',
                desc: 'date, e.g. 2020-11-22'
            },
            to: {
                type: 'string',
                desc: 'date, e.g. 2020-11-29'
            },
            symbol: {
                type: 'string',
                desc: 'ticker symbol, e.g. TSLA'
            }
        },
        async (argv) => {
            if (argv.verbose) {
                console.log(`getting transactions for ${argv.accountId}`);
            }
            return getTransactions({
                accountId: argv.accountId,
                transactionId: argv.transactionId,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        });

};
exports.handler = (argv) => {};
