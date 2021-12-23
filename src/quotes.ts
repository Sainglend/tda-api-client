// Copyright (C) 2020-1 Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";

export interface IGetQuoteConfig extends TacRequestConfig {
    symbol: string,
}

export interface IQuoteMutualFund {
    symbol: string,
    description: string,
    closePrice: number,
    netChange: number,
    totalVolume: number,
    tradeTimeInLong: number,
    exchange: string,
    exchangeName: string,
    digits: number,
    "52WkHigh": number,
    "52WkLow": number,
    nAV: number,
    peRatio: number,
    divAmount: number,
    divYield: number,
    divDate: string,
    securityStatus: string,
    [key: string]: any,
}

export interface IQuoteFuture {
    symbol: string,
    bidPriceInDouble: number,
    askPriceInDouble: number,
    lastPriceInDouble: number,
    bidId: string,
    askId: string,
    highPriceInDouble: number,
    lowPriceInDouble: number,
    closePriceInDouble: number,
    exchange: string,
    description: string,
    lastId: string,
    openPriceInDouble: number,
    changeInDouble: number,
    futurePercentChange: number,
    exchangeName: string,
    securityStatus: string,
    openInterest: number,
    mark: number,
    tick: number,
    tickAmount: number,
    product: string,
    futurePriceFormat: string,
    futureTradingHours: string,
    futureIsTradable: boolean,
    futureMultiplier: number,
    futureIsActive: boolean,
    futureSettlementPrice: number,
    futureActiveSymbol: string,
    futureExpirationDate: string,
}

export interface IQuoteFutureOption {
    symbol: string,
    bidPriceInDouble: number,
    askPriceInDouble: number,
    lastPriceInDouble: number,
    highPriceInDouble: number,
    lowPriceInDouble: number,
    closePriceInDouble: number,
    description: string,
    openPriceInDouble: number,
    netChangeInDouble: number,
    openInterest: number,
    exchangeName: string,
    securityStatus: string,
    volatility: number,
    moneyIntrinsicValueInDouble: number,
    multiplierInDouble: number,
    digits: number,
    strikePriceInDouble: number,
    contractType: string,
    underlying: string,
    timeValueInDouble: number,
    deltaInDouble: number,
    gammaInDouble: number,
    thetaInDouble: number,
    vegaInDouble: number,
    rhoInDouble: number,
    mark: number,
    tick: number,
    tickAmount: number,
    futureIsTradable: boolean,
    futureTradingHours: string,
    futurePercentChange: number,
    futureIsActive: boolean,
    futureExpirationDate: number,
    expirationType: string,
    exerciseType: string,
    inTheMoney: boolean,
}

export interface IQuoteIndex {
    symbol: string,
    description: string,
    lastPrice: number,
    openPrice: number,
    highPrice: number,
    lowPrice: number,
    closePrice: number,
    netChange: number,
    totalVolume: number,
    tradeTimeInLong: number,
    exchange: string,
    exchangeName: string,
    digits: number,
    "52WkHigh": number,
    "52WkLow": number,
    securityStatus: string,
    [key: string]: any,
}

export interface IOption {
    symbol: string,
    description: string,
    bidPrice: number,
    bidSize: number,
    askPrice: number,
    askSize: number,
    lastPrice: number,
    lastSize: number,
    openPrice: number,
    highPrice: number,
    lowPrice: number,
    closePrice: number,
    netChange: number,
    totalVolume: number,
    quoteTimeInLong: number,
    tradeTimeInLong: number,
    mark: number,
    openInterest: number,
    volatility: number,
    moneyIntrinsicValue: number,
    multiplier: number,
    strikePrice: number,
    contractType: string,
    underlying: string,
    timeValue: number,
    deliverables: string,
    delta: number,
    gamma: number,
    theta: number,
    vega: number,
    rho: number,
    securityStatus: string,
    theoreticalOptionValue: number,
    underlyingPrice: number,
    uvExpirationType: string,
    exchange: string,
    exchangeName: string,
    settlementType: string,
}

export interface IForex {
    symbol: string,
    bidPriceInDouble: number,
    askPriceInDouble: number,
    lastPriceInDouble: number,
    highPriceInDouble: number,
    lowPriceInDouble: number,
    closePriceInDouble: number,
    exchange: string,
    description: string,
    openPriceInDouble: number,
    changeInDouble: number,
    percentChange: number,
    exchangeName: string,
    digits: number,
    securityStatus: string,
    tick: number,
    tickAmount: number,
    product: string,
    tradingHours: string,
    isTradable: boolean,
    marketMaker: string,
    "52WkHighInDouble": number,
    "52WkLowInDouble": number,
    mark: number,
    [key: string]: any,
}

export interface IQuoteETF {
    symbol: string,
    description: string,
    bidPrice: number,
    bidSize: number,
    bidId: string,
    askPrice: number,
    askSize: number,
    askId: string,
    lastPrice: number,
    lastSize: number,
    lastId: string,
    openPrice: number,
    highPrice: number,
    lowPrice: number,
    closePrice: number,
    netChange: number,
    totalVolume: number,
    quoteTimeInLong: number,
    tradeTimeInLong: number,
    mark: number,
    exchange: string,
    exchangeName: string,
    marginable: boolean,
    shortable: boolean,
    volatility: number,
    digits: number,
    "52WkHigh": number,
    "52WkLow": number,
    peRatio: number,
    divAmount: number,
    divYield: number,
    divDate: string,
    securityStatus: string,
    regularMarketLastPrice: number,
    regularMarketLastSize: number,
    regularMarketNetChange: number,
    regularMarketTradeTimeInLong: number,
    [key: string]: any,
}

export interface IQuoteEquity {
    symbol: string,
    description: string,
    bidPrice: number,
    bidSize: number,
    bidId: string,
    askPrice: number,
    askSize: number,
    askId: string,
    lastPrice: number,
    lastSize: number,
    lastId: string,
    openPrice: number,
    highPrice: number,
    lowPrice: number,
    closePrice: number,
    netChange: number,
    totalVolume: number,
    quoteTimeInLong: number,
    tradeTimeInLong: number,
    mark: number,
    exchange: string,
    exchangeName: string,
    marginable: boolean,
    shortable: boolean,
    volatility: number,
    digits: number,
    "52WkHigh": number,
    "52WkLow": number,
    peRatio: number,
    divAmount: number,
    divYield: number,
    divDate: string,
    securityStatus: string,
    regularMarketLastPrice: number,
    regularMarketLastSize: number,
    regularMarketNetChange: number,
    regularMarketTradeTimeInLong: number,
    [key: string]: any,
}

/**
 * Get quotes for a single symbol, e.g. AAPL, MSFT_021822C200
 * If you want to get quotes for symbols containing special characters, use getQuotes
 * e.g. futures and forex
 * Can optionally use apikey for delayed data with an unauthenticated request.
 */
export async function getQuote(config: IGetQuoteConfig): Promise<IQuoteETF | IOption | IForex | IQuoteEquity | IQuoteFuture | IQuoteFutureOption | IQuoteIndex | IQuoteMutualFund> {
    config.path = `/v1/marketdata/${config.symbol}/quotes` +
        (config.apikey ? `?apikey=${config.apikey}` : "");

    return await apiGet(config);
}

/**
 * Get quotes for one or more symbols. Input property "symbol" should be a comma-separated string,
 * e.g. "F,O,TSLA,/ES,EUR/USD,T_021822C25"
 * Can optionally use apikey for delayed data with an unauthenticated request.
 */
export async function getQuotes(config: IGetQuoteConfig): Promise<(IQuoteETF | IOption | IForex | IQuoteEquity | IQuoteFuture | IQuoteFutureOption | IQuoteIndex | IQuoteMutualFund)[]> {
    config.path = `/v1/marketdata/quotes?symbol=${config.symbol}` +
        (config.apikey ? `&apikey=${config.apikey}` : "");

    return await apiGet(config);
}
