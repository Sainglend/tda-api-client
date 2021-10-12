// Copyright (C) 2020  Aaron Satterlee

import { Arguments } from "yargs";
import {apiGet} from "./tdapiinterface";

/**
 * Enum for the transaction types
 * @enum
 */
export enum TRANSACTION_TYPE {
    ALL = 'ALL',
    TRADE = 'TRADE',
    BUY_ONLY = 'BUY_ONLY',
    SELL_ONLY = 'SELL_ONLY',
    CASH_IN_OR_CASH_OUT = 'CASH_IN_OR_CASH_OUT',
    CHECKING = 'CHECKING',
    DIVIDEND = 'DIVIDEND',
    INTEREST = 'INTEREST',
    OTHER = 'OTHER',
    ADVISOR_FEES = 'ADVISOR_FEES',
}

/**
 * Gets all transactions for a specific account with the set options, such as symbol, type, startDate (yyyy-MM-dd), endDate (yyyy-MM-dd) (maximum time span is 1 year)
 * @param {Object} config - takes accountId, and optionally: type (ENUM is TRANSACTION_TYPE), startDate (yyyy-MM-dd), endDate (yyyy-MM-dd)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getTransactions(config: any) {
    config.path = `/v1/accounts/${config.accountId}/transactions?` +
        (config.type ? `type=${config.type}&` : '') +
        (config.startDate ? `startDate=${config.startDate}&` : '') +
        (config.endDate ? `endDate=${config.endDate}&` : '') +
        (config.symbol ? `symbol=${config.symbol}` : '');

    return apiGet(config);
}

/**
 * Get a sepcific transaction for a specified account
 * @param {Object} config - takes accountId, transactionId
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getTransaction(config: any) {
    config.path = `/v1/accounts/${config.accountId}/transactions/${config.transactionId}`;

    return apiGet(config);
}

export default {
    command: 'trans <command>',
    desc: 'Retrieve transaction history',
    builder: (yargs: any) => {
        return yargs
            .command('get <transactionId> <accountId>',
                'Get a specific transaction by <transactionId> for a specific <accountId>',
                {},
                async (argv: Arguments) => {
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
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting transactions for ${argv.accountId}`);
                    }
                    return getTransactions({
                        accountId: argv.accountId,
                        transactionId: argv.transactionId,
                        verbose: argv.verbose || false
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });

    },
    handler: (argv: Arguments) => {},
};
