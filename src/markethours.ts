// Copyright (C) 2020-1  Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";

export enum EMarkets {
    EQUITY = "EQUITY",
    OPTION = "OPTION",
    FUTURE = "FUTURE",
    BOND = "BOND",
    FOREX = "FOREX"
}

export interface IMarketSession {
    start: string,
    end: string,
}

export interface IMarketHours {
    category: string,
    date: string,
    exchange: string,
    isOpen: boolean,
    marketType: EMarkets,
    product: string,
    productName: string,
    sessionHours: {[index: string]: IMarketSession},
}

export interface IProductMarketHours {
    [index:string]: IMarketHours
}

export interface IMarketMarketHours {
    [index:string]: IProductMarketHours
}

export interface IGetSingleMarketHoursConfig extends TacRequestConfig {
    market: EMarkets | string,
    date: string,
}

export interface IGetMultiMarketHoursConfig extends TacRequestConfig {
    markets: EMarkets[] | string,
    date: string,
}

/**
 * Get market open hours for a specified date in ISO-8601 (yyyy-MM-dd and yyyy-MM-dd'T'HH:mm:ssz)
 * (e.g. 2020-09-18) and a specified market (use ENUM).
 * Can optionally use apikey for delayed data with an unauthenticated request.
 */
export async function getSingleMarketHours(config: IGetSingleMarketHoursConfig): Promise<IMarketMarketHours> {
    config.path = `/v1/marketdata/${config.market}/hours?date=${config.date}` +
        (config.apikey ? `&apikey=${config.apikey}` : "");
    return await apiGet(config);
}

/**
 * Get market open hours for a specified date (e.g. 2020-09-18) and a comma-separated set of markets from
 * EQUITY, OPTION, FUTURE, BOND, or FOREX, e.g. "EQUITY,OPTION".
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes markets, date, apikey (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getMultipleMarketHours(config: IGetMultiMarketHoursConfig): Promise<IMarketMarketHours> {
    const markets = Array.isArray(config.markets) ? config.markets.join(",") : config.markets;
    config.path = `/v1/marketdata/hours?markets=${markets}&date=${config.date}` +
        (config.apikey ? `&apikey=${config.apikey}` : "");
    return await apiGet(config);
}
