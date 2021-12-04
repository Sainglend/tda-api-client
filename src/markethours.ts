// Copyright (C) 2020-1  Aaron Satterlee

import {apiGet} from "./tdapiinterface";

export enum MARKETS {
    EQUITY = 'EQUITY',
    OPTION = 'OPTION',
    FUTURE = 'FUTURE',
    BOND = 'BOND',
    FOREX = 'FOREX'
}

/**
 * Get market open hours for a specified date (e.g. 2020-09-18) and a specified market (use ENUM).
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes market (ENUM is MARKETS), date, apikey (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getSingleMarketHours(config: any) {
    config.path = `/v1/marketdata/${config.market}/hours?date=${config.date}` +
        (config.apikey ? `&apikey=${config.apikey}` : '');

    return apiGet(config);
}

/**
 * Get market open hours for a specified date (e.g. 2020-09-18) and a comma-separated set of markets from EQUITY, OPTION, FUTURE, BOND, or FOREX, e.g. "EQUITY,OPTION".
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes markets, date, apikey (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getMultipleMarketHours(config: any) {
    config.path = `/v1/marketdata/hours?markets=${config.markets}&date=${config.date}` +
        (config.apikey ? `&apikey=${config.apikey}` : '');

    return apiGet(config);
}
