// Copyright (C) 2020-1 Aaron Satterlee

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
