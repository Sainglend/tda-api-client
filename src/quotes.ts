// Copyright (C) 2020-1 Aaron Satterlee

import {apiGet} from "./tdapiinterface";

/**
 * Get quotes for a single symbol, e.g. AAPL
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes symbol, apikey (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getQuote(config: any) {
    config.path = `/v1/marketdata/${config.symbol}/quotes` +
        (config.apikey ? `?apikey=${config.apikey}` : '');

    return apiGet(config);
}

/**
 * Get quotes for one or more symbols using a comma-separated string, e.g. F,O,TSLA.
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes symbol, apikey (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getQuotes(config: any) {
    config.path = `/v1/marketdata/quotes?symbol=${config.symbol}` +
        (config.apikey ? `&apikey=${config.apikey}` : '');

    return apiGet(config);
}
