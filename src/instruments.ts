// Copyright (C) 2020-1  Aaron Satterlee

import {apiGet} from "./tdapiinterface";
import {IInstrument} from "./accounts";

export enum PROJECTION_TYPE {
    SYMBOL_SEARCH = "symbol-search",
    SYMBOL_REGEX = "symbol-regex",
    DESC_SEARCH = "desc-search",
    DESC_REGEX = "desc-regex",
    FUNDAMENTAL = "fundamental",
}

/**
 * Search for an instrument using search string or regex (config.symbol) and search type (config.projection>)
 * projection (use ENUM) is one of: symbol-search, symbol-regex, desc-search, desc-regex, fundamental.
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes symbol, projection (ENUM is PROJECTION_TYPE), apikey (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function searchInstruments(config: any): Promise<IInstrument> {
    config.path = `/v1/instruments?symbol=${config.symbol}&projection=${config.projection}` +
        (config.apikey ? `&apikey=${config.apikey}` : '');

    return apiGet(config);
}

/**
 * Get an instrument by CUSIP (unique id number assigned to all stocks and registered bonds in US/CA).
 * List of instruments here: https://www.sec.gov/divisions/investment/13flists.htm
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes cusip, apikey (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getInstrument(config: any) {
    config.path = `/v1/instruments/${config.cusip}` +
        (config.apikey ? `?apikey=${config.apikey}` : '');

    return apiGet(config);
}
