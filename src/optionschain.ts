// Copyright (C) 2020-1  Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";
import {IOptionDeliverable} from "./sharedTypes";

/**
 * Defines what range of strikes to return as results
 * @default ALL
 * @enum {string}
 */
export enum RANGE {
    /** DEFAULT */
    ALL = "ALL",
    /** In-the-money strikes */
    ITM = "ITM",
    /** Near-the-money strikes */
    NTM = "NTM",
    /** Out-of-the-money strikes */
    OTM = "OTM",
    /** Strikes Above Market */
    SAK = "SAK",
    /** Strikes Below Market */
    SBK = "SBK",
    /** Strikes Near Market */
    SNK = "SNK",
}

/**
 * @default SINGLE
 * @enum {string}
 */
export enum STRATEGY {
    /** DEFAULT */
    SINGLE = "SINGLE",
    /** allows use of the volatility, underlyingPrice, interestRate, and daysToExpiration params to calculate theoretical values */
    ANALYTICAL = "ANALYTICAL",
    COVERED = "COVERED",
    VERTICAL = "VERTICAL",
    CALENDAR = "CALENDAR",
    STRANGLE = "STRANGLE",
    STRADDLE = "STRADDLE",
    BUTTERFLY = "BUTTERFLY",
    CONDOR = "CONDOR",
    DIAGONAL = "DIAGONAL",
    COLLAR = "COLLAR",
    ROLL = "ROLL",
}

/**
 * @default ALL
 * @enum {string}
 */
export enum CONTRACT_TYPE {
    /** DEFAULT */
    ALL = "ALL",
    CALL = "CALL",
    PUT = "PUT",
}

/**
 * @default ALL
 * @enum {string}
 */
export enum EXPIRATION_MONTH {
    /** DEFAULT */
    ALL = "ALL",
    JAN = "JAN",
    FEB = "FEB",
    MAR = "MAR",
    APR = "APR",
    MAY = "MAY",
    JUN = "JUN",
    JUL = "JUL",
    AUG = "AUG",
    SEP = "SEP",
    OCT = "OCT",
    NOV = "NOV",
    DEC = "DEC",
}

/**
 * @default ALL
 * @enum {string}
 */
export enum OPTION_TYPE {
    /** DEFAULT */
    ALL = "ALL",
    /** Standard contracts */
    STANDARD = "S",
    /** Non-standard contracts */
    NONSTANDARD = "NS"
}

export interface IOptionChain {
    symbol: string,
    status: string,
    underlying: IUnderlying,
    strategy: STRATEGY,
    interval: number,
    isDelayed: boolean,
    isIndex: boolean,
    daysToExpiration: number,
    interestRate: number,
    underlyingPrice: number,
    volatility: number,
    callExpDateMap: {[index:string]: IOptionStrike},
    putExpDateMap: {[index:string]: IOptionStrike},
}

export interface IOptionStrike {
    [index:string]: IOption[],
}

export interface IOption {
    putCall: "PUT" | "CALL",
    symbol: string,
    description: string,
    exchangeName: string,
    bidPrice: number,
    askPrice: number,
    lastPrice: number,
    markPrice: number,
    bidSize: number,
    askSize: number,
    lastSize: number,
    highPrice: number,
    lowPrice: number,
    openPrice: number,
    closePrice: number,
    totalVolume: number,
    quoteTimeInLong: number,
    tradeTimeInLong: number,
    netChange: number,
    volatility: number,
    delta: number,
    gamma: number,
    theta: number,
    vega: number,
    rho: number,
    timeValue: number,
    openInterest: number,
    isInTheMoney: boolean,
    theoreticalOptionValue: number,
    theoreticalVolatility: number,
    isMini: boolean,
    isNonStandard: boolean,
    optionDeliverablesList: IOptionDeliverable[],
    strikePrice: number,
    expirationDate: string,
    expirationType: string,
    multiplier: number,
    settlementType: string,
    deliverableNote: string,
    isIndexOption: boolean,
    percentChange: number,
    markChange: number,
    markPercentChange: number,
}

export enum EOptionsExchange {
    IND = "IND",
    ASE = "ASE",
    NYS = "NYS",
    NAS = "NAS",
    NAP = "NAP",
    PAC = "PAC",
    OPR = "OPR",
    BATS = "BATS",
}

export interface IUnderlying {
    ask: number,
    askSize: number,
    bid: number,
    bidSize: number,
    change: number,
    close: number,
    delayed: boolean,
    description: string,
    exchangeName: EOptionsExchange,
    fiftyTwoWeekHigh: number,
    fiftyTwoWeekLow: number,
    highPrice: number,
    last: number,
    lowPrice: number,
    mark: number,
    markChange: number,
    markPercentChange: number,
    openPrice: number,
    percentChange: number,
    quoteTime: number,
    symbol: string,
    totalVolume: number,
    tradeTime: number,
}


export interface IGetOptionChainConfig extends TacRequestConfig {
    symbol: string,
    contractType?: CONTRACT_TYPE,
    expMonth?: EXPIRATION_MONTH,
    optionType?: OPTION_TYPE,
    strategy?: STRATEGY,
    range?: RANGE,
    includeQuotes?: boolean,
    fromDate?: string,
    toDate?: string,
    strikeCount?: number,
    interval?: number,
    volatility?: number,
    underlyingPrice?: number,
    interestRate?: number,
    daysToExpiration?: number,
}

/**
 * Get an options chain for a given symbol. Carefully use config options.
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * Config takes symbol, contractType (ENUM is CONTRACT_TYPE), expMonth (ENUM is EXPIRATION_MONTH), optionType (ENUM is OPTION_TYPE), strategy (ENUM is STRATEGY), range (ENUM is RANGE), includeQuotes, and optionals are:
 * fromDate (yyyy-MM-dd), toDate (yyyy-MM-dd), strikeCount, interval, volatility, underlyingPrice, interestRate, daysToExpiration, apikey
 * The return type is nested, looking like
 * IOptionChain { putExpDateMap: { dateDTEString: { strike: IOption }}}
 * e.g. IOptionChain { putExpDateMap: { "2021-12-10:2": { "45.0": IOption }}}
 * Note the date param is of the format date:DTE
 */
export async function getOptionChain(config: IGetOptionChainConfig): Promise<IOptionChain> {
    config.path =  `/v1/marketdata/chains?` +
        `symbol=${config.symbol}` +
        (config.contractType ? `&contractType=${config.contractType}` : "") +
        (config.expMonth ? `&expMonth=${config.expMonth}` : "") +
        (config.optionType ? `&optionType=${config.optionType}` : "") +
        (config.strategy ? `&strategy=${config.strategy}` : "") +
        (config.range ? `&range=${config.range}` : "") +
        (config.includeQuotes ? `&includeQuotes=${config.includeQuotes}` : "") +
        (config.fromDate ? `&fromDate=${config.fromDate}` : "") +
        (config.toDate ? `&toDate=${config.toDate}` : "") +
        (config.strikeCount ? `&strikeCount=${config.strikeCount}` : "") +
        (config.interval ? `&interval=${config.interval}` : "") +
        (config.volatility ? `&volatility=${config.volatility}` : "") +
        (config.underlyingPrice ? `&underlyingPrice=${config.underlyingPrice}` : "") +
        (config.interestRate ? `&interestRate=${config.interestRate}` : "") +
        (config.daysToExpiration ? `&daysToExpiration=${config.daysToExpiration}` : "") +
        (config.apikey ? `&apikey=${config.apikey}` : "");
    return await apiGet(config);
}