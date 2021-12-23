// Copyright (C) 2020-1  Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";
import {IBond, IInstrument} from "./sharedTypes";

export enum PROJECTION_TYPE {
    SYMBOL_SEARCH = "symbol-search",
    SYMBOL_REGEX = "symbol-regex",
    DESC_SEARCH = "desc-search",
    DESC_REGEX = "desc-regex",
    FUNDAMENTAL = "fundamental",
}

export interface IFundamental extends IInstrument {
    high52: number, // double
    low52: number, // double
    dividendAmount: number, // double
    dividendYield: number, // double
    dividendDate: string,
    peRatio: number, // double
    pegRatio: number, // double
    pbRatio: number, // double
    prRatio: number, // double
    pcfRatio: number, // double
    grossMarginTTM: number, // double
    grossMarginMRQ: number, // double
    netProfitMarginTTM: number, // double
    netProfitMarginMRQ: number, // double
    operatingMarginTTM: number, // double
    operatingMarginMRQ: number, // double
    returnOnEquity: number, // double
    returnOnAssets: number, // double
    returnOnInvestment: number, // double
    quickRatio: number, // double
    currentRatio: number, // double
    interestCoverage: number, // double
    totalDebtToCapital: number, // double
    ltDebtToEquity: number, // double
    totalDebtToEquity: number, // double
    epsTTM: number, // double
    epsChangePercentTTM: number, // double
    epsChangeYear: number, // double
    epsChange: number, // double
    revChangeYear: number, // double
    revChangeTTM: number, // double
    revChangeIn: number, // double
    sharesOutstanding: number, // double
    marketCapFloat: number, // double
    marketCap: number, // double
    bookValuePerShare: number, // double
    shortIntToFloat: number, // double
    shortIntDayToCover: number, // double
    divGrowthRate3Year: number, // double
    dividendPayAmount: number, // double
    dividendPayDate: string,
    beta: number, // double
    vol1DayAvg: number, // double
    vol10DayAvg: number, // double
    vol3MonthAvg: number, // double
}

export interface ISearchInstrumentsFundamentalsConfig extends TacRequestConfig {
    symbol: string,
}

export interface ISearchInstrumentsConfig extends ISearchInstrumentsFundamentalsConfig {
    projection: string,
}

export interface IGetInstrumentsConfig extends TacRequestConfig {
    cusip: string,
}

/**
 * Search for an instrument using search string or regex (config.symbol) and search type (config.projection>)
 * projection (use ENUM) is one of: symbol-search, symbol-regex, desc-search, desc-regex, fundamental.
 * Can optionally use apikey for delayed data with an unauthenticated request.
 */
export async function searchInstruments(config: ISearchInstrumentsConfig): Promise<IFundamental | IBond[] |  IInstrument[]> {
    config.path = `/v1/instruments?symbol=${config.symbol}&projection=${config.projection}` +
        (config.apikey ? `&apikey=${config.apikey}` : "");
    return await apiGet(config);
}

/**
 * This is specifically a shortcut for getting fundamental data for a particular symbol, which can also be achieved
 * by called searchInstruments() with config.projection = PROJECTION_TYPE.FUNDAMENTAL. The availability of this
 * feature seemed less obvious behind the name "searchInstruments"
 * Can optionally use apikey for delayed data with an unauthenticated request.
 */
export async function searchInstrumentFundamentals(config: ISearchInstrumentsFundamentalsConfig): Promise<IFundamental> {
    config.path = `/v1/instruments?symbol=${config.symbol}&projection=${PROJECTION_TYPE.FUNDAMENTAL}` +
        (config.apikey ? `&apikey=${config.apikey}` : "");
    return await apiGet(config);
}

/**
 * Get an instrument by CUSIP (unique id number assigned to all stocks and registered bonds in US/CA).
 * List of instruments here: https://www.sec.gov/divisions/investment/13flists.htm
 * Can optionally use apikey for delayed data with an unauthenticated request.
 */
export async function getInstrument(config: IGetInstrumentsConfig): Promise<IInstrument | IBond> {
    config.path = `/v1/instruments/${config.cusip}` +
        (config.apikey ? `?apikey=${config.apikey}` : "");
    return await apiGet(config);
}
