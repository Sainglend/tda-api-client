// Copyright (C) 2020-2  Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";
import {IOptionDeliverable} from "./sharedTypes";

/**
 * Defines what range of strikes to return as results
 * @default ALL
 */
export enum ERange {
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
 */
export enum EStrategy {
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
 */
export enum EContractType {
    /** DEFAULT */
    ALL = "ALL",
    CALL = "CALL",
    PUT = "PUT",
}

/**
 * @default ALL
 */
export enum EExpirationMonth {
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
 */
export enum EOptionType {
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
    strategy: EStrategy,
    interval: number,
    isDelayed: boolean,
    isIndex: boolean,
    daysToExpiration: number,
    interestRate: number,
    underlyingPrice: number,
    volatility: number,
    callExpDateMap: {[index:string]: IOptionStrike},
    putExpDateMap: {[index:string]: IOptionStrike},
    intervals?: number[],
    monthlyStrategyList?: IOptionMonthlyStrategyListItem[],
}

export interface IOptionMonthlyStrategyListItem {
    month: string,
    year: number,
    day: number,
    daysToExp: number,
    secondaryMonth: string,
    secondaryYear: number,
    secondaryDay: number,
    secondaryDaysToExp: number,
    type: "C" | "P",
    secondaryType: "C" | "P",
    optionStrategyList: IOptionStrategyListItem[]
}

export interface IOptionStrategyListItem {
    primaryLeg: IOptionStrategyOption,
    secondaryLeg: IOptionStrategyOption,
    strategyStrike: string,
    strategyBid: number,
    strategyAsk: number,
}

export interface IOptionStrategyOption {
    symbol: string,
    putCallInd: "C" | "P",
    description: string,
    bid: number,
    ask: number,
    range: ERange,
    strikePrice: number,
    totalVolume: number,
}

export interface IOptionStrike {
    [index:string]: IOption[],
}

export interface IOption {
    putCall: "PUT" | "CALL",
    symbol: string,
    description: string,
    exchangeName: string,
    bid: number,
    ask: number,
    last: number,
    mark: number,
    bidSize: number,
    askSize: number,
    bidAskSize: string,
    lastSize: number,
    highPrice: number,
    lowPrice: number,
    openPrice: number,
    closePrice: number,
    totalVolume: number,
    tradeDate: any,
    tradeTimeInLong: number,
    quoteTimeInLong: number,
    netChange: number,
    volatility: number,
    delta: number,
    gamma: number,
    theta: number,
    vega: number,
    rho: number,
    openInterest: number,
    timeValue: number,
    isInTheMoney: boolean,
    theoreticalOptionValue: number,
    theoreticalVolatility: number,
    optionDeliverablesList: IOptionDeliverable[],
    strikePrice: number,
    expirationDate: number,
    daysToExpiration: number,
    expirationType: string,
    lastTradingDay: number,
    multiplier: number,
    settlementType: string,
    deliverableNote: string,
    isIndexOption: boolean,
    percentChange: number,
    markChange: number,
    markPercentChange: number,
    intrinsicValue: number,
    pennyPilot: boolean,
    nonStandard: boolean,
    inTheMoney: boolean,
    mini: boolean,
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
    contractType?: EContractType,
    // Return only options expiring in the specified month
    expMonth?: EExpirationMonth,
    optionType?: EOptionType,
    strategy?: EStrategy,
    range?: ERange,
    includeQuotes?: boolean,
    // Only return expirations after this date. For strategies, expiration refers to the nearest term expiration in the strategy. Valid ISO-8601 formats are: yyyy-MM-dd and yyyy-MM-dd'T'HH:mm:ssz.
    fromDate?: string,
    // Only return expirations before this date. For strategies, expiration refers to the nearest term expiration in the strategy. Valid ISO-8601 formats are: yyyy-MM-dd and yyyy-MM-dd'T'HH:mm:ssz.
    toDate?: string,
    // The number of strikes to return above and below the at-the-money price.
    strikeCount?: number,
    // Provide a strike price to return options only at that strike price.
    strike?: number,
    // Strike interval for spread strategy chains
    interval?: number,
    // Volatility to use in calculations. Applies only to ANALYTICAL strategy chains
    volatility?: number,
    // Underlying price to use in calculations. Applies only to ANALYTICAL strategy chains
    underlyingPrice?: number,
    // Interest rate to use in calculations. Applies only to ANALYTICAL strategy chains
    interestRate?: number,
    // Days to expiration to use in calculations. Applies only to ANALYTICAL strategy chains
    daysToExpiration?: number,
}

/**
 * Get an options chain for a given optionable symbol. Carefully use config options.
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * The return type is nested, looking like, e.g.:
 * IOptionChain { putExpDateMap: { dateDTEString: { strike: IOption }}}
 * e.g. IOptionChain { putExpDateMap: { "2021-12-10:2": { "45.0": IOption }}}
 * Note the date param is of the format: "YYYY-MM-DD:DTE"
 */
export async function getOptionChain(config: IGetOptionChainConfig): Promise<IOptionChain> {
    config.path =  `/v1/marketdata/chains?` +
        `symbol=${config.symbol}` +
        (config.contractType ? `&contractType=${config.contractType}` : "") +
        (config.strikeCount ? `&strikeCount=${config.strikeCount}` : "") +
        (config.includeQuotes ? `&includeQuotes=${config.includeQuotes}` : "") +
        (config.strategy ? `&strategy=${config.strategy}` : "") +
        (config.interval ? `&interval=${config.interval}` : "") +
        (config.strike ? `&strike=${config.strike}` : "") +
        (config.range ? `&range=${config.range}` : "") +
        (config.fromDate ? `&fromDate=${config.fromDate}` : "") +
        (config.toDate ? `&toDate=${config.toDate}` : "") +
        (config.volatility ? `&volatility=${config.volatility}` : "") +
        (config.underlyingPrice ? `&underlyingPrice=${config.underlyingPrice}` : "") +
        (config.interestRate ? `&interestRate=${config.interestRate}` : "") +
        (config.daysToExpiration ? `&daysToExpiration=${config.daysToExpiration}` : "") +
        (config.expMonth ? `&expMonth=${config.expMonth}` : "") +
        (config.optionType ? `&optionType=${config.optionType}` : "") +
        (config.apikey ? `&apikey=${config.apikey}` : "");
    return await apiGet(config);
}
