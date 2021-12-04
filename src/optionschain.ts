// Copyright (C) 2020-1  Aaron Satterlee

import {apiGet} from "./tdapiinterface";

/**
 * Defines what range of strikes to return as results
 * @default ALL
 * @enum {string}
 */
export enum RANGE {
    /** DEFAULT */
    ALL = 'ALL',
    /** In-the-money strikes */
    ITM = 'ITM',
    /** Near-the-money strikes */
    NTM = 'NTM',
    /** Out-of-the-money strikes */
    OTM = 'OTM',
    /** Strikes Above Market */
    SAK = 'SAK',
    /** Strikes Below Market */
    SBK = 'SBK',
    /** Strikes Near Market */
    SNK = 'SNK',
}

/**
 * @default SINGLE
 * @enum {string}
 */
export enum STRATEGY {
    /** DEFAULT */
    SINGLE = 'SINGLE',
    /** allows use of the volatility, underlyingPrice, interestRate, and daysToExpiration params to calculate theoretical values */
    ANALYTICAL = 'ANALYTICAL',
    COVERED = 'COVERED',
    VERTICAL = 'VERTICAL',
    CALENDAR = 'CALENDAR',
    STRANGLE = 'STRANGLE',
    STRADDLE = 'STRADDLE',
    BUTTERFLY = 'BUTTERFLY',
    CONDOR = 'CONDOR',
    DIAGONAL = 'DIAGONAL',
    COLLAR = 'COLLAR',
    ROLL = 'ROLL',
}

/**
 * @default ALL
 * @enum {string}
 */
export enum CONTRACT_TYPE {
    /** DEFAULT */
    ALL = 'ALL',
    CALL = 'CALL',
    PUT = 'PUT',
}

/**
 * @default ALL
 * @enum {string}
 */
export enum EXPIRATION_MONTH {
    /** DEFAULT */
    ALL = 'ALL',
    JAN = 'JAN',
    FEB = 'FEB',
    MAR = 'MAR',
    APR = 'APR',
    MAY = 'MAY',
    JUN = 'JUN',
    JUL = 'JUL',
    AUG = 'AUG',
    SEP = 'SEP',
    OCT = 'OCT',
    NOV = 'NOV',
    DEC = 'DEC',
}

/**
 * @default ALL
 * @enum {string}
 */
export enum OPTION_TYPE {
    /** DEFAULT */
    ALL = 'ALL',
    /** Standard contracts */
    STANDARD = 'S',
    /** Non-standard contracts */
    NONSTANDARD = 'NS'
}

/**
 * Get an options chain for a given symbol. Carefully use config options.
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes symbol, contractType (ENUM is CONTRACT_TYPE), expMonth (ENUM is EXPIRATION_MONTH), optionType (ENUM is OPTION_TYPE), strategy (ENUM is STRATEGY), range (ENUM is RANGE), includeQuotes, and optionals are:
 * fromDate (yyyy-MM-dd), toDate (yyyy-MM-dd), strikeCount, interval, volatility, underlyingPrice, interestRate, daysToExpiration, apikey
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getOptionChain(config: any) {
    config.path =  `/v1/marketdata/chains?` +
        `symbol=${config.symbol}` +
        (config.contractType ? `&contractType=${config.contractType}` : '') +
        (config.expMonth ? `&expMonth=${config.expMonth}` : '') +
        (config.optionType ? `&optionType=${config.optionType}` : '') +
        (config.strategy ? `&strategy=${config.strategy}` : '') +
        (config.range ? `&range=${config.range}` : '') +
        (config.includeQuotes ? `&includeQuotes=${config.includeQuotes}` : '') +
        (config.fromDate ? `&fromDate=${config.fromDate}` : '') +
        (config.toDate ? `&toDate=${config.toDate}` : '') +
        (config.strikeCount ? `&strikeCount=${config.strikeCount}` : '') +
        (config.interval ? `&interval=${config.interval}` : '') +
        (config.volatility ? `&volatility=${config.volatility}` : '') +
        (config.underlyingPrice ? `&underlyingPrice=${config.underlyingPrice}` : '') +
        (config.interestRate ? `&interestRate=${config.interestRate}` : '') +
        (config.daysToExpiration ? `&daysToExpiration=${config.daysToExpiration}` : '') +
        (config.apikey ? `&apikey=${config.apikey}` : '');

    return apiGet(config);
}
