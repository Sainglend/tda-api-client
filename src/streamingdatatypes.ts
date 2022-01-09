import {EAssetType, ICandle} from "./sharedTypes";

export interface FuturesChartResponseRough extends StringIndexed {
    key: string,
    seq: number,
    "0": string, // key
    "1": number, // datetime
    "2": number, // open
    "3": number, // high
    "4": number, // low
    "5": number, // close
    "6": number // volume
}

export interface FuturesChartResponse extends StringIndexed, ICandle {
    key: string,
    symbol: string,
    seq: number,
}

export interface EquityChartResponseRough extends StringIndexed {
    key: string,
    seq: number,
    "0": string, // key
    "1": number, // open
    "2": number, // high
    "3": number, // low
    "4": number, // close
    "5": number, // volume
    "6": number, // sequence
    "7": number, // chart datetime
    "8"?: number, // chart day
}

export interface EquityChartResponse extends StringIndexed, ICandle {
    key: string,
    symbol: string,
    seq: number,
}

export interface ChartHistoryFuturesCandleRough extends StringIndexed {
    "0": number, // datetime
    "1": number, // open
    "2": number, // high
    "3": number, // low
    "4": number, // close
    "5": number, // volume
}

export interface ChartHistoryFuturesRough extends StringIndexed {
    key: string, // futures symbol
    "0": string, // request id?
    "1": number, // no idea
    "2": number, // candle array length?
    "3": ChartHistoryFuturesCandleRough[],
}

export interface ChartHistoryFutures extends StringIndexed {
    key: string,
    requestId: string,
    prop1: number,
    count: number,
    candles: ICandle[],
}

export interface StringIndexed {
    [index: string]: any
}

export interface StreamingResponseData {
    service: string,
    content?: any,
    timestamp: number
}

export enum EXCHANGES {
    /** NASDAQ */
    NASDAQ="q",
    NYSE="n",
    AMEX="a",
    OTCBB="u",
    PACIFIC="p",
    INDICES="x",
    AMEX_INDEX="g",
    MUTUAL_FUND="m",
    PINK_SHEET="9",
    ICE="I",
    CME="E",
    LIFFEUS="L",
}

export enum TRADING_STATUS {
    NORMAL="Normal",
    HALTED="Halted",
    CLOSED="Closed",
}

export interface L1FuturesOptionsQuoteRough extends StringIndexed {
    "key": string, // symbol
    "delayed": boolean,
    "1": number, // bid price
    "2": number, // ask price
    "3": number, // last trade price
    "4": number, // bid size
    "5": number, // ask size
    "6": EXCHANGES, // exchange with best ask
    "7": EXCHANGES, // exchange with best bid
    "8": number, // daily volume
    "9": number, // last size
    "10": number, // quote time ms epoch
    "11": number, // trade time ms epoch
    "12": number, // daily high
    "13": number, // daily low
    "14": number, // prev day close
    "15": EXCHANGES, // primary listing exchange
    "16": string, // description
    "17": number, // daily open
    "18": number, // open interest
    "19": number, // ? unknown
    // 20 unused?
    // 21 unused?
    "22": number, // multiplier
    "23": number, // ? unknown
    "24": string, // underlying symbol
    "25": number, // strike
    "26": number, // expiration date of this contract, ms since epoch
}

export interface L1OptionsQuoteRough extends StringIndexed {
    "key": string,
    "cusip": string,
    "assetMainType": EAssetType,
    "delayed": boolean,
    "1": string, // description, company, index, fund name
    "2": number, // bid
    "3": number, // ask
    "4": number, // last
    "5": number, // daily high
    "6": number, // daily low
    "7": number, // prev day close
    "8": number, // total volume
    "9": number, // open interest
    "10": number, // volatility
    "11": number, // quote time since, sec since midnight
    "12": number, // trade time, sec since midnight
    "13": number, // intrinsic value
    "14": number, // quote day (day of month?)
    "15": number, // trade day (day of month?)
    "16": number, // expiration year
    "17": number, // contract multiplier
    "18": number, // valid decimal digits
    "19": number, // daily open
    "20": number, // bid size
    "21": number, // ask size
    "22": number, // last size
    "23": number, // net change, last - prev close
    "24": number, // strike price
    "25": string, // contract type (standard, non-standard?)
    "26": string, // underyling
    "27": number, // expiration month (0 based?)
    "28": string, // deliverables
    "29": number, // time value
    "30": number, // expiration day
    "31": number, // days to expiry
    "32": number, // delta
    "33": number, // gamma
    "34": number, // theta
    "35": number, // vega
    "36": number, // rho
    "37": TRADING_STATUS, // trading status
    "38": number, // theoretical option value
    "39": number, // underlying price
    "40": string, // uv expiration type (american/european?)
    "41": number, // mark
}

export interface L1EquityQuoteRough extends StringIndexed {
    "key": string, // symbol
    "cusip": string,
    "assetMainType": EAssetType,
    "delayed": boolean,
    "1": number, // bid price
    "2": number, // ask price
    "3": number, // last price
    "4": number, // bid size
    "5": number, // ask size
    "6": EXCHANGES, // ask exchange id
    "7": EXCHANGES, // bid exchange id
    "8": number, // volume
    "9": number, // last size, in 100s
    "10": number, // trade time, seconds since midnight EST
    "11": number, // quote time, seconds since midnight EST
    "12": number, // daily high price
    "13": number, // daily low price
    "14": string, // bid tick, up or down
    "15": number, // prev day's close
    "16": EXCHANGES, // primary listing exchange, type EXCHANGES
    "17": boolean, // marginable
    "18": boolean, // shortable
    "19": number, // island bid NOT USED
    "20": number, // island ask NOT USED
    "21": number, // island volume NOT USED
    "22": number, // quote day (day of the month?)
    "23": number, // trade day
    "24": number, // volatility
    "25": string, // description: company, index, or fund name
    "26": EXCHANGES, // last id for exchange
    "27": number, // digits ??? (number of valid decimal points?)
    "28": number, // day open price
    "29": number, // net change, last-prev close
    "30": number, // 52wk high
    "31": number, // 52wk low
    "32": number, // PE ratio
    "33": number, // dividend amount
    "34": number, // dividend yield
    "35": number, // island bid size NOT USED
    "36": number, // island ask size NOT USED
    "37": number, // NAV - mutual fund net asset value
    "38": number, // fund price
    "39": string, // exchange name
    "40": string, // dividend date
    "41": boolean, // is last quote regular market quote
    "42": boolean, // regular market trade
    "43": number, // regular market last price
    "44": number, // reg last size
    "45": number, // reg trade time
    "46": number, // reg market trade day
    "47": number, // reg market net change
    "48": TRADING_STATUS, // security status: Normal, Halted, Closed
    "49": number, // mark
    "50": number, // quote time ms since epoch
    "51": number, // trade time ms since epoch
    "52": number, // reg mkt trade time ms epoch
}

export interface L1FuturesQuoteRough {
    "key": string, //symbol
    "1": number, //bid
    "2": number, //ask
    "3": number, //last
    "4": number, //bidSize
    "5": number, //askSize
    "6": EXCHANGES, // bestAskExchange
    "7": EXCHANGES, // bestBidExchange
    "8": number, // dailyVolume
    "9": number, // lastSize
    "10": number, // lastQuoteTime ms since epoch
    "11": number, // lastTradeTime ms since epoch
    "12": number, // dailyHigh
    "13": number, // dailyLow
    "14": number, // prevDayClose
    "15": EXCHANGES, // exchangeId
    "16": string, // description of product
    "17": EXCHANGES, // lastTradeExchange
    "18": number, // dailyOpen
    "19": number, // netChange
    "20": number, // pctChange
    "21": string, // exchangeName
    "22": TRADING_STATUS, // symbolStatus
    "23": number, // openInterest
    "24": number, // mark
    "25": number, // tickSize
    "26": number, // tickAmount
    "27": string, // futuresProduct
    "28": string, // priceFormat fraction or decimal
    "29": string, // tradingHours
    "30": boolean, // isTradable
    "31": number, // contractMultiplier
    "32": boolean, // isContractActive
    "33": number, // settlementPrice
    "34": string, // activeContractSymbol
    "35": number, // contractExpirationDate ms since epoch
    "delayed": boolean,
    "assetMainType": EAssetType,
}

export interface L1ForexQuoteRough extends StringIndexed {
    "1": number, // current best bid price
    "2": number, // current ask
    "3": number, // last trade
    "4": number, // bid size
    "5": number, // ask size
    "6": number, // volume
    "7": number, // last size
    "8": number, // quote time ms epoch
    "9": number, // trade time ms epoch
    "10": number, // high price
    "11": number, // low price
    "12": number, // prev day close
    "13": EXCHANGES, // primary listing exchange
    "14": string, // description
    "15": number, // day's open price
    "16": number, // net change last - prev close
    "17": number, // percent change
    "18": string, // exchange name
    "19": number, // valid decimal digits
    "20": TRADING_STATUS, // trading status
    "21": number, // tick, min price movement
    "22": number, // tick amount, tick*multiplier
    "23": string, // product name
    "24": string, // trading hours
    "25": boolean, // is tradable
    "26": string, // market maker
    "27": number, // 52wk high
    "28": number, // 52wk low
    "29": number, // mark
    "key": string,
    "assetMainType": EAssetType,
    "delayed": boolean,
}

// TODO: verify 23/24 in forex since there are two 23s in the docs. is it trading hours string or product string?

export interface L1FuturesOptionsQuote extends StringIndexed {
    key: string, // "key": string, // symbol
    symbol: string,
    delayed: boolean, // "delayed": boolean,

    // contract/product info
    description: string, // "16": string, // description
    multiplier: number, // "22": number, // multiplier
    underlyingSymbol: string, // "24": string, // underlying symbol
    strike: number, // "25": number, // strike
    expirationDateMSEpoch: number, // "26": number, // expiration date of this contract, ms since epoch

    // price
    bid: number, // "1": number, // bid price
    ask: number, // "2": number, // ask price
    last: number, // "3": number, // last trade price
    dailyHigh: number, // "12": number, // daily high
    dailyLow: number, // "13": number, // daily low
    previousDayClose: number, // "14": number, // prev day close
    dailyOpen: number, // "17": number, // daily open
    unknown19: number, // "19": number, // ?
    unknown23: number, // "23": number, // ?

    // volume
    bidSize: number, // "4": number, // bid size
    askSize: number, // "5": number, // ask size
    dailyVolume: number, // "8": number, // total volume
    lastSize: number, // "9": number, // last size
    openInterest: number, // "18": number, // open interest

    // exchange
    exchangeBestAsk: EXCHANGES | string, // "6": EXCHANGES, // exchange with best ask
    exchangeBestBid: EXCHANGES | string, // "7": EXCHANGES, // exchange with best bid
    exchangeOfPrimaryListing: EXCHANGES, // "15": EXCHANGES, // primary listing exchange

    // time
    timeLasatQuote: number, // "10": number, // quote time ms epoch
    timeLastTrade: number, // "11": number, // trade time ms epoch
}

export interface L1OptionsQuote extends StringIndexed {
    timestamp: number, // imposed by transform function

    key: string,
    cusip: string,
    assetMainType: EAssetType,
    delayed: boolean,
    symbol: string, // "0": string, // symbol
    description: string, // "1": string, // description, company, index, fund name
    tradingStatus: TRADING_STATUS, // "37": TRADING_STATUS, // trading status
    underlyingPrice: number, // "39": number, // underlying price

    // price
    bid: number, // "2": number, // bid
    ask: number, // "3": number, // ask
    last: number, // "4": number, // last
    dailyHigh: number, // "5": number, // daily high
    dailyLow: number, // "6": number, // daily low
    previousDayClose: number, // "7": number, // prev day close
    dailyOpen: number, // "19": number, // daily open
    mark: number, // "41": number, // mark

    // derived from price
    netChange: number, // "23": number, // net change, last - prev close
    intrinsicValues: number, // "13": number, // intrinsic value
    volatility: number, // "10": number, // volatility
    timeValue: number, // "29": number, // time value
    delta: number, // "32": number, // delta
    gamma: number, // "33": number, // gamma
    theta: number, // "34": number, // theta
    vega: number, // "35": number, // vega
    rho: number, // "36": number, // rho
    theoreticalOptionValue: number, // "38": number, // theoretical option value

    // volume
    dailyVolume: number, // "8": number, // total volume
    bidSize: number, // "20": number, // bid size
    askSize: number, // "21": number, // ask size
    lastSize: number, // "22": number, // last size
    openInterest: number, // "9": number, // open interest

    // time
    timeLastQuote: number, // ms since epoch
    timeLastTrade: number, // ms since epoch
    quoteDay: number, // "14": number, // quote day (day of month?)
    tradeDay: number, // "15": number, // trade day (day of month?)
    timeLastQuoteSecsFromMidnight: number, // "11": number, // quote time since, sec since midnight
    timeLastTradeSecsFromMidnight: number, // "12": number, // trade time, sec since midnight

    // contract info
    multiplier: number, // "17": number, // contract multiplier
    validDigits: number, // "18": number, // valid decimal digits
    strikePrice: number, // "24": number, // strike price
    contractType: string, // "25": string, // contract type (standard, non-standard?)
    underlying: string, // "26": string, // underyling
    expirationMonth: number, // "27": number, // expiration month (0 based?)
    deliverables: string, // "28": string, // deliverables
    expirationDay: number, // "30": number, // expiration day
    daysTilExpiration: number, // "31": number, // days to expiry
    uvExpirationType: string, // "40": string, // uv expiration type (american/european?)
    expirationYear: number, // "16": number, // expiration year
}

export interface L1ForexQuote extends StringIndexed {
    timestamp: number, // imposed by transform function
    key: string,
    assetMainType: EAssetType,
    delayed: boolean,
    symbol: string, // "0": string, // ticker symbol in upper case
    description: string, // "14": string, // description
    tradingStatus: TRADING_STATUS, // "20": TRADING_STATUS, // trading status
    productName: string, // "23": string, // product name
    tradingHours: string, // "24": string, // trading hours
    isTradable: boolean, // "25": boolean, // is tradable
    marketMaker: string, // "26": string, // market maker

    // price
    bid: number, // "1": number, // current best bid price
    ask: number, // "2": number, // current ask
    last: number, // "3": number, // last trade
    dailyHigh: number, // "10": number, // high price
    dailyLow: number, // "11": number, // low price
    previousDayClose: number, // "12": number, // prev day close
    dailyOpen: number, // "15": number, // day's open price
    mark: number, // "29": number, // mark
    fiftyTwoWeekHigh: number, // "27": number, // 52wk high
    fiftyTwoWeekLow: number, // "28": number, // 52wk low


    // derived from price
    netChange: number, // "16": number, // net change last - prev close
    percentChange: number, // "17": number, // percent change

    // volume
    bidSize: number, // "4": number, // bid size
    askSize: number, // "5": number, // ask size
    dailyVolume: number, // "6": number, // volume
    lastSize: number, // "7": number, // last size

    // time
    timeLastQuote: number, // "8": number, // quote time ms epoch
    timeLastTrade: number, // "9": number, // trade time ms epoch

    // exchange
    exchangeOfPrimaryListing: EXCHANGES, // "13": EXCHANGES, // primary listing exchange
    exchangeName: string, // "18": string, // exchange name

    // contract/product info
    validDigits: number, // "19": number, // valid decimal digits
    tickSize: number, // "21": number, // tick, min price movement
    tickAmount: number, // "22": number, // tick amount, tick*multiplier
}

export interface L1EquityQuote extends StringIndexed {
    timestamp: number, // will be imposed by transform function

    key: string,
    assetMainType: EAssetType,
    cusip: string,
    delayed: boolean,
    // symbol and about info
    symbol: string, // "0": string, // symbol
    description: string, // "25": string, // description: company, index, or fund name
    tradingStatus: TRADING_STATUS, // "48": TRADING_STATUS, // security status: Normal, Halted, Closed
    peRatio: number, // "32": number, // PE ratio
    dividendAmount: number, // "33": number, // dividend amount
    dividendYield: number, // "34": number, // dividend yield
    dividendDate: string, // "40": string, // dividend date

    // price info
    bid: number, // "1": number, // bid price
    ask: number, // "2": number, // ask price
    last: number, // "3": number, // last price
    dailyHigh: number, // "12": number, // daily high price
    dailyLow: number, // "13": number, // daily low price
    dailyOpen: number, // "28": number, // day open price
    previousDayClose: number, // "15": number, // prev day's close
    mark: number, // "49": number, // mark
    fiftyTwoWeekHigh: number, // "30": number, // 52wk high
    fiftyTwoWeekLow: number, // "31": number, // 52wk low
    fundPrice: number, // "38": number, // fund price
    regularMarketLastPrice: number, // "43": number, // regular market last price

    // info derived from price
    netChange: number, // "29": number, // net change, last-prev close
    volatility: number, // "24": number, // volatility
    NAV: number, // "37": number, // NAV - mutual fund net asset value
    bidTickDirection: string, // "14": string, // bid tick, up or down
    validDigits: number, // "27": number, // digits ??? (number of valid decimal points?)
    regularMarketNetchange: number, // "47": number, // reg market net change

    // volume info
    bidSize: number, // "4": number, // bid size
    askSize: number, // "5": number, // ask size
    dailyVolume: number,  // "8": number, // volume
    lastSize: number, // "9": number, // last size, in 100s
    regularMarketLastSize: number, // "44": number, // reg last size

    // exchanges
    exchangeBestAsk: EXCHANGES, // "6": EXCHANGES, // ask exchange id
    exchangeBestBid: EXCHANGES, // "7": EXCHANGES, // bid exchange id
    exchangeOfPrimaryListing: EXCHANGES, // "16": EXCHANGES, // primary listing exchange, type EXCHANGES
    exchangeLastTrade: EXCHANGES, // "26": EXCHANGES, // last id for exchange
    exchangeName: string, // "39": string, // exchange name



    // trade info
    isMarginable: boolean, // "17": boolean, // marginable
    isShortable: boolean, // "18": boolean, // shortable
    isLastQuoteFromRegularMarket: boolean, // "41": boolean, // is last quote regular market quote
    isLastTradeFromRegularMarket: boolean, // "42": boolean, // regular market trade


    // time info
    timeLastQuote: number, // "50": number, // quote time ms since epoch
    timeLastTrade: number, // "51": number, // trade time ms since epoch
    lastRegularMarketTradeTimeMSEpoch: number, // "52": number, // reg mkt trade time ms epoch
    quoteDay: number, // "22": number, // quote day (day of the month?)
    tradeDay: number, // "23": number, // trade day
    lastRegularMarketTradeTimeSecsFromMidnight: number, // "45": number, // reg trade time
    lastRegularMarketTradeDay: number, // "46": number, // reg market trade day
    lastTradeTimeSecsFromMidnight: number, // "10": number, // trade time, seconds since midnight EST
    lastQuoteTimeSecsFromMidnight: number, // "11": number, // quote time, seconds since midnight EST


    // island
    islandBidSize: number, // "35": number, // island bid size NOT USED
    islandAskSize: number, // "36": number, // island ask size NOT USED
    islandBid: number, // "19": number, // island bid NOT USED
    islandAsk: number, // "20": number, // island ask NOT USED
    islandVolume: number, // "21": number, // island volume NOT USED
}

export interface L1FuturesQuote extends StringIndexed {
    timestamp: number, // will be imposed by transform function
    // symbol and about info
    key: string, // "key": string, //symbol
    assetMainType: EAssetType,
    symbol: string, // "0"?: string, //symbol
    description: string, // "16"?: string, // description of product
    tradingStatus: TRADING_STATUS, // "22"?: TRADING_STATUS, // symbolStatus
    futuresProduct: string, // "27"?: string, // futuresProduct
    tradingHours: string, // "29"?: string, // tradingHours
    isTradable: boolean, // "30"?: boolean, // isTradable

    // price info
    bid: number, // "1"?: number, //bid
    ask: number, // "2"?: number, //ask
    last: number, // "3"?: number, //last
    dailyHigh: number, // "12"?: number, // dailyHigh
    dailyLow: number, // "13"?: number, // dailyLow
    previousDayClose: number, // "14"?: number, // prevDayClose
    dailyOpen: number, // "18"?: number, // dailyOpen
    mark: number, // "24"?: number, // mark
    settlementPrice: number, // "33"?: number, // settlementPrice

    // info derived from price
    netChange: number, // "19"?: number, // netChange
    percentChange: number, // "20"?: number, // pctChange

    // volume info
    bidSize: number, // "4"?: number, //bidSize
    askSize: number, // "5"?: number, //askSize
    dailyVolume: number, // "8"?: number, // dailyVolume
    lastSize: number, // "9"?: number, // lastSize
    openInterest: number, // "23"?: number, // openInterest

    // contract info
    tickSize: number, // "25"?: number, // tickSize
    tickAmount: number, // "26"?: number, // tickAmount
    priceFormat: string, // "28"?: string, // priceFormat fraction or decimal
    multiplier: number, // "31"?: number, // contractMultiplier
    isContractActive: boolean, // "32"?: boolean, // isContractActive
    activeContractSymbol: string, // "34"?: string, // activeContractSymbol
    contractExpirationMSEpoch: number, // "35"?: number, // contractExpirationDate ms since epoch

    // exchanges
    exchangeOfPrimaryListing: EXCHANGES, // "15"?: EXCHANGES, // exchangeId
    exchangeBestAsk: EXCHANGES, // "6"?: EXCHANGES, // bestAskExchange
    exchangeBestBid: EXCHANGES, // "7"?: EXCHANGES, // bestBidExchange
    exchangeLastTrade: EXCHANGES, // "17"?: EXCHANGES, // lastTradeExchange
    exchangeName: string, // "21"?: string, // exchangeName

    // time info
    timeLastQuote: number, // "10"?: number, // lastQuoteTime ms since epoch
    timeLastTrade: number, // "11"?: number, // lastTradeTime ms since epoch

    // metadata
    delayed: boolean
}

interface L1QuoteCommon extends StringIndexed {
    timestamp: number, // from outer object
    key: string,
    symbol: string,
    description: string,
    tradingStatus: TRADING_STATUS,

    // price
    bid: number,
    ask: number,
    last: number,
    dailyOpen: number,
    dailyHigh: number,
    dailyLow: number,
    previousDayClose: number,
    mark: number,

    // derived from price
    netChange: number,

    // volume
    bidSize: number,
    askSize: number,
    lastSize: number,
    dailyVolume: number,

    // time
    // TODO: are times for L1 options REALLY seconds since midnight instead of ms since epoch
    timeLastQuote: number,
    timeLastTrade: number,
}

export interface TimeSaleRough extends StringIndexed {
    "key": string, // symbol
    "seq": number, // sequence
    "0": string, // symbol
    "1": number, // trade time ms since epoch
    "2": number, // last price
    "3": number, // last size
    "4": number, // last sequence
}

export interface TimeSale extends StringIndexed {
    "key": string,
    "sequence": number,
    "tradeTime": number,
    "lastPrice": number,
    "lastSize": number,
    "lastSequence": number,
}

export interface NewsHeadlineRough extends StringIndexed {
    "key": string, // symbol
    "0": string, // symbol
    "1": number, // error code, if any
    "2": number, // story datetime, ms since epoch
    "3": string, // headline id
    "4": string, // status
    "5": string, // headline
    "6": string, // story id
    "7": number, // count for keyword
    "8": string, // keyword array
    "9": boolean, // is hot
    "10": string, // char for story source
}

export interface NewsHeadline extends StringIndexed {
    timestamp: number,
    seq: number,
    key: string,
    symbol: string,
    errorCode: number,
    storyDatetime: number,
    headlineId: string,
    status: string,
    headline: string,
    storyId: string,
    keywordCount: number,
    keywords: string,
    isHot: boolean,
    storySource: string,
}

export interface AcctActivityRough extends StringIndexed {
    "1": string, // account number
    "2": string, // message type
    "3": string, // message data
    "key": string, // subscription key
    "seq": number, // sequence number
}

export interface AcctActivity extends StringIndexed {
    accountNumber: string,
    messageType: EAcctActivityMsgType,
    messageData: any, // xml
    key: string, // subscription key
    sequence: number, // sequence number
}

export enum EAcctActivityMsgType {
    SUBSCRIBED = "SUBSCRIBED",
    ERROR = "ERROR",
    BrokenTrade = "BrokenTrade",
    ManualExecution = "ManualExecution",
    OrderActivation = "OrderActivation",
    OrderCancelReplaceRequest = "OrderCancelReplaceRequest",
    OrderCancelRequest = "OrderCancelRequest",
    OrderEntryRequest = "OrderEntryRequest",
    OrderFill = "OrderFill",
    OrderPartialFill = "OrderPartialFill",
    OrderRejection = "OrderRejection",
    TooLateToCancel = "TooLateToCancel",
    UROUT = "UROUT",
}

export enum EServices {
    ADMIN = "ADMIN",
    ACCT_ACTIVITY = "ACCT_ACTIVITY",

    ACTIVES_NASDAQ = "ACTIVES_NASDAQ",
    ACTIVES_NYSE = "ACTIVES_NYSE",
    ACTIVES_OTCBB = "ACTIVES_OTCBB",
    ACTIVES_OPTIONS = "ACTIVES_OPTIONS",

    FOREX_BOOK = "FOREX_BOOK",
    FUTURES_BOOK = "FUTURES_BOOK",
    LISTED_BOOK = "LISTED_BOOK",
    NASDAQ_BOOK = "NASDAQ_BOOK",
    OPTIONS_BOOK = "OPTIONS_BOOK",
    FUTURES_OPTIONS_BOOK = "FUTURES_OPTIONS_BOOK",

    CHART_EQUITY = "CHART_EQUITY",

    CHART_FUTURES = "CHART_FUTURES",
    CHART_HISTORY_FUTURES = "CHART_HISTORY_FUTURES",
    QUOTE = "QUOTE",
    LEVELONE_FUTURES = "LEVELONE_FUTURES",
    LEVELONE_FOREX = "LEVELONE_FOREX",
    LEVELONE_FUTURES_OPTIONS = "LEVELONE_FUTURES_OPTIONS",
    OPTION = "OPTION",
    LEVELTWO_FUTURES = "LEVELTWO_FUTURES",

    NEWS_HEADLINE = "NEWS_HEADLINE",
    NEWS_STORY = "NEWS_STORY",
    NEWS_HEADLINE_LIST = "NEWS_HEADLINE_LIST",

    STREAMER_SERVER = "STREAMER_SERVER",

    TIMESALE_EQUITY = "TIMESALE_EQUITY",
    TIMESALE_FUTURES = "TIMESALE_FUTURES",
    TIMESALE_FOREX = "TIMESALE_FOREX",
    TIMESALE_OPTIONS = "TIMESALE_OPTIONS",
}

export enum EChartHistoryFuturesFrequency {
    MINUTE_ONE="m1",
    MINUTE_FIVE="m5",
    MINUTE_TEN="m10",
    MINUTE_THIRTY="m30",
    HOUR_ONE="h1",
    DAY_ONE="d1",
    WEEK_ONE="w1",
    MONTH_ONE="n1",
}

export enum EResponseCodes {
    ACCT_ACTIVITY="ACCT_ACTIVITY",
    ADMIN="ADMIN",
    ACTIVES_NASDAQ="ACTIVES_NASDAQ",
    ACTIVES_NYSE="ACTIVES_NYSE",
    ACTIVES_OTCBB="ACTIVES_OTCBB",
    ACTIVES_OPTIONS="ACTIVES_OPTIONS",
}

export enum ECommands {
    QOS="QOS",
    LOGIN="LOGIN",
    LOGOUT="LOGOUT",
    SUBS="SUBS",
    GET="GET",
    UNSUBS="UNSUBS",
    ADD="ADD",
    VIEW="VIEW",
    STREAM="STREAM",
}

export enum EQosLevels {
    L0_EXPRESS_500MS = 0,
    L1_REALTIME_750MS = 1,
    L2_FAST_1000MS = 2,
    L3_MODERATE_1500MS = 3,
    L4_SLOW_3000MS = 4,
    L5_DELAYED_5000MS = 5,
}

export interface IStreamNotify {
    heartbeat: string, // timestamp as string
}

export interface IStreamResponse {
    command: ECommands,
    content: any,
    requestId: string,
    service: EServices,
    timestamp: number,
}

export interface ILoginLogoutResponse {
    code: EAdminResponseCode,
    // streamer server id, or "SUCCESS" for logout
    msg: string,
}

export enum EAdminResponseCode {
    SUCCESS = 0,
    LOGIN_DENIED = 3,
}

export interface IResponseObject {
    response?: IStreamResponse[],
    notify?: IStreamNotify[],
    data?: any[],
    snapshot?: any[],
}
