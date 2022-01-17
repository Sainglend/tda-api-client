// Copyright (C) 2020-2 Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";

export interface IGetQuoteConfig extends TacRequestConfig {
    symbol: string,
}

export interface IQuoteMutualFund extends IQuoteGeneric {
    "52WkHigh": number,
    "52WkLow": number,
    closePrice: number,
    digits: number,
    divAmount: number,
    divDate: string,
    divYield: number,
    exchange: string,
    nAV: number,
    netChange: number,
    peRatio: number,
    totalVolume: number,
    tradeTimeInLong: number,
}

export interface IQuoteFuture extends IQuoteGeneric {
    askId: string,
    askPriceInDouble: number,
    bidId: string,
    bidPriceInDouble: number,
    changeInDouble: number,
    closePriceInDouble: number,
    exchange: string,
    futureActiveSymbol: string,
    futureExpirationDate: string,
    futureIsActive: boolean,
    futureIsTradable: boolean,
    futureMultiplier: number,
    futurePercentChange: number,
    futurePriceFormat: string,
    futureSettlementPrice: number,
    futureTradingHours: string,
    highPriceInDouble: number,
    lastId: string,
    lastPriceInDouble: number,
    lowPriceInDouble: number,
    mark: number,
    openInterest: number,
    openPriceInDouble: number,
    product: string,
    tickAmount: number,
    tick: number,
}

export interface IQuoteFutureOption extends IQuoteGeneric {
    askPriceInDouble: number,
    bidPriceInDouble: number,
    closePriceInDouble: number,
    contractType: string,
    deltaInDouble: number,
    digits: number,
    exerciseType: string,
    expirationType: string,
    futureExpirationDate: number,
    futureIsActive: boolean,
    futureIsTradable: boolean,
    futurePercentChange: number,
    futureTradingHours: string,
    gammaInDouble: number,
    highPriceInDouble: number,
    inTheMoney: boolean,
    lastPriceInDouble: number,
    lowPriceInDouble: number,
    mark: number,
    moneyIntrinsicValueInDouble: number,
    multiplierInDouble: number,
    netChangeInDouble: number,
    openInterest: number,
    openPriceInDouble: number,
    rhoInDouble: number,
    strikePriceInDouble: number,
    thetaInDouble: number,
    tickAmount: number,
    tick: number,
    timeValueInDouble: number,
    underlying: string,
    vegaInDouble: number,
    volatility: number,
}

export interface IQuoteIndex extends IQuoteGeneric {
    "52WkHigh": number,
    "52WkLow": number,
    closePrice: number,
    digits: number,
    exchange: string,
    highPrice: number,
    lastPrice: number,
    lowPrice: number,
    netChange: number,
    openPrice: number,
    totalVolume: number,
    tradeTimeInLong: number,
}

export interface IQuoteOption extends IQuoteGeneric {
    askPrice: number,
    askSize: number,
    bidPrice: number,
    bidSize: number,
    closePrice: number,
    contractType: string,
    deliverables: string,
    delta: number,
    exchange: string,
    gamma: number,
    highPrice: number,
    lastPrice: number,
    lastSize: number,
    lowPrice: number,
    mark: number,
    moneyIntrinsicValue: number,
    multiplier: number,
    netChange: number,
    openInterest: number,
    openPrice: number,
    quoteTimeInLong: number,
    rho: number,
    settlementType: string,
    strikePrice: number,
    theoreticalOptionValue: number,
    theta: number,
    timeValue: number,
    totalVolume: number,
    tradeTimeInLong: number,
    underlyingPrice: number,
    underlying: string,
    uvExpirationType: string,
    vega: number,
    volatility: number,

}

export interface IQuoteForex extends IQuoteGeneric {
    "52WkHighInDouble": number,
    "52WkLowInDouble": number,
    askPriceInDouble: number,
    bidPriceInDouble: number,
    changeInDouble: number,
    closePriceInDouble: number,
    digits: number,
    exchange: string,
    highPriceInDouble: number,
    isTradable: boolean,
    lastPriceInDouble: number,
    lowPriceInDouble: number,
    marketMaker: string,
    mark: number,
    openPriceInDouble: number,
    percentChange: number,
    product: string,
    tickAmount: number,
    tick: number,
    tradingHours: string,
}

export interface IQuoteETF extends IQuoteGeneric {
    "52WkHigh": number,
    "52WkLow": number,
    askId: string,
    askPrice: number,
    askSize: number,
    bidId: string,
    bidPrice: number,
    bidSize: number,
    closePrice: number,
    digits: number,
    divAmount: number,
    divDate: string,
    divYield: number,
    exchange: string,
    highPrice: number,
    lastId: string,
    lastPrice: number,
    lastSize: number,
    lowPrice: number,
    marginable: boolean,
    mark: number,
    netChange: number,
    openPrice: number,
    peRatio: number,
    quoteTimeInLong: number,
    regularMarketLastPrice: number,
    regularMarketLastSize: number,
    regularMarketNetChange: number,
    regularMarketTradeTimeInLong: number,
    shortable: boolean,
    totalVolume: number,
    tradeTimeInLong: number,
    volatility: number,
}

export interface IQuoteEquity extends IQuoteGeneric {
    "52WkHigh": number,
    "52WkLow": number,
    askId: string,
    askPrice: number,
    askSize: number,
    bidId: string,
    bidPrice: number,
    bidSize: number,
    closePrice: number,
    digits: number,
    divAmount: number,
    divDate: string,
    divYield: number,
    exchange: string,
    highPrice: number,
    lastId: string,
    lastPrice: number,
    lastSize: number,
    lowPrice: number,
    marginable: boolean,
    mark: number,
    netChange: number,
    openPrice: number,
    peRatio: number,
    quoteTimeInLong: number,
    regularMarketLastPrice: number,
    regularMarketLastSize: number,
    regularMarketNetChange: number,
    regularMarketTradeTimeInLong: number,
    shortable: boolean,
    totalVolume: number,
    tradeTimeInLong: number,
    volatility: number,
}


export interface IQuoteGeneric {
    description: string,
    exchangeName: string,
    securityStatus: string,
    symbol: string,
    [index: string]: any,
}

/**
 * The type IQuoteResult is indexed with the quoted symbol
 * @example
 * quoteResult["MSFT"]
 */
export type IQuoteResult = Record<string, (IQuoteGeneric | IQuoteETF | IQuoteOption | IQuoteForex | IQuoteEquity | IQuoteFuture | IQuoteFutureOption | IQuoteIndex | IQuoteMutualFund)>;

/**
 * Get quotes for a single symbol, e.g. AAPL, MSFT_021822C200
 * For symbols containing special characters, use getQuotes instead,
 * e.g. futures (/ES), forex (EUR/USD), indexes ($SPX.X)
 * Can optionally use apikey for delayed data with an unauthenticated request.
 */
export async function getQuote(config: IGetQuoteConfig): Promise<IQuoteResult> {
    config.path = `/v1/marketdata/${encodeURIComponent(config.symbol)}/quotes` +
        (config.apikey ? `?apikey=${config.apikey}` : "");
    return await apiGet(config);
}

/**
 * Get quotes for one or more symbols. Input property "symbol" should be a comma-separated string,
 * e.g. "F,O,TSLA,/ES,EUR/USD,T_021822C25,$SPX.X"
 * Can optionally use apikey for delayed data with an unauthenticated request.
 */
export async function getQuotes(config: IGetQuoteConfig): Promise<IQuoteResult> {
    config.path = `/v1/marketdata/quotes?symbol=${config.symbol}` +
        (config.apikey ? `&apikey=${config.apikey}` : "");
    return await apiGet(config);
}
