// Copyright (C) 2020-2  Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";
import {EAssetType} from "./sharedTypes";

export enum EProjectionType {
    // Retrieve instrument data of a specific symbol or cusip
    SYMBOL_SEARCH = "symbol-search",
    // Retrieve instrument data for all symbols matching regex. Example: symbol=XYZ.* will return all symbols beginning with XYZ
    SYMBOL_REGEX = "symbol-regex",
    // Retrieve instrument data for instruments whose description contains the word supplied. Example: symbol=FakeCompany will return all instruments with FakeCompany in the description.
    DESC_SEARCH = "desc-search",
    // Search description with full regex support. Example: symbol=XYZ.[A-C] returns all instruments whose descriptions contain a word beginning with XYZ followed by a character A through C.
    DESC_REGEX = "desc-regex",
    // Returns fundamental data for a single instrument specified by exact symbol.'
    FUNDAMENTAL = "fundamental",
}

export interface ISearchInstrumentResult {
    assetType: EAssetType,
    cusip: string,
    symbol: string,
    description: string,
    exchange: string,
    fundamental?: IFundamental,
    bondPrice?: number,
}

export interface IFundamental {
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
    projection: EProjectionType,
}

export interface IGetInstrumentConfig extends TacRequestConfig {
    cusip: string,
}

export interface ISearchInstrumentResults {
    [key: string]: ISearchInstrumentResult,
}

/**
 * Search for an instrument using search string or regex (config.symbol) and search type (config.projection)
 * Projection (you may use enum EProjectionType) is one of: symbol-search, symbol-regex, desc-search, desc-regex, fundamental.
 * Can optionally use apikey for delayed data with an unauthenticated request.
 */
export async function searchInstruments(config: ISearchInstrumentsConfig): Promise<ISearchInstrumentResults> {
    config.path = `/v1/instruments`
        + `?symbol=${config.symbol}`
        + `&projection=${config.projection}`
        + (config.apikey ? `&apikey=${config.apikey}` : "");
    return await apiGet(config);
}

/**
 * This is specifically a shortcut for getting fundamental data for a particular symbol, which can also be achieved
 * by calling searchInstruments() with config.projection = EProjectionType.FUNDAMENTAL. The availability of this
 * feature seemed less obvious behind the name "searchInstruments"
 * Can optionally use apikey for delayed data with an unauthenticated request.
 */
export async function searchInstrumentFundamentals(config: ISearchInstrumentsFundamentalsConfig): Promise<ISearchInstrumentResults> {
    config.path = `/v1/instruments`
        + `?symbol=${config.symbol}`
        + `&projection=${EProjectionType.FUNDAMENTAL}`
        + (config.apikey ? `&apikey=${config.apikey}` : "");
    return await apiGet(config);
}

/**
 * Get an instrument by CUSIP (unique id number assigned to all stocks and registered bonds in US/CA).
 * List of instruments here: https://www.sec.gov/divisions/investment/13flists.htm
 * Can optionally use apikey for delayed data with an unauthenticated request.
 */
export async function getInstrument(config: IGetInstrumentConfig): Promise<ISearchInstrumentResult[]> {
    config.path = `/v1/instruments/${config.cusip}`
        + (config.apikey ? `?apikey=${config.apikey}` : "");
    return await apiGet(config);
}
