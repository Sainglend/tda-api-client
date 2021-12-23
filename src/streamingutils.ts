import {
    L1FuturesQuote,
    L1FuturesQuoteRough,
    FuturesChartResponse,
    FuturesChartResponseRough,
    ChartHistoryFutures,
    ChartHistoryFuturesRough,
    ChartHistoryFuturesCandleRough,
    EquityChartResponseRough,
    EquityChartResponse,
    TimeSaleRough,
    TimeSale,
    L1FuturesOptionsQuoteRough,
    L1FuturesOptionsQuote,
    L1OptionsQuoteRough,
    L1OptionsQuote,
    L1EquityQuoteRough,
    L1EquityQuote,
    L1ForexQuoteRough,
    L1ForexQuote,
    NewsHeadlineRough,
    NewsHeadline,
    AcctActivityRough,
    AcctActivity,
} from "./streamingdatatypes";
import {ICandle} from "./sharedTypes";
const convert = require("xml-js");

export default class StreamingUtils {
    static buildNumberArray(start: number, finish: number) : string {
        const arr = [];
        for (let i = start; i <= finish; i++) {
            arr.push(i);
        }
        return arr.join(",");
    }

    static normalizeSymbol(ticker: string) {
        // console.log(`in normalizesymbol with ticker: ${ticker}`);
        if (ticker) {
            return ticker.replace(/\W/g, "_");
        } else return ticker;
    }

    static jsonToQueryString(json: any) {
        return Object.keys(json).map(function(key) {
            return encodeURIComponent(key) + "=" +
                encodeURIComponent(json[key]);
        }).join("&");
    }

    static transformFuturesChartResponse(resp: FuturesChartResponseRough, timestamp: number) : FuturesChartResponse {
        return {
            timestamp: timestamp,
            key: resp.key,
            seq: resp.seq,
            datetime: resp["1"],
            open: resp["2"],
            high: resp["3"],
            low: resp["4"],
            close: resp["5"],
            volume: resp["6"]
        };
    }

    static transformEquityChartResponse(resp: EquityChartResponseRough) : EquityChartResponse {
        return {
            key: resp.key,
            seq: resp.seq,
            datetime: resp["7"],
            open: resp["1"],
            high: resp["2"],
            low: resp["3"],
            close: resp["4"],
            volume: resp["5"]
        };
    }

    static transformChartHistoryFuturesResponse(resp: ChartHistoryFuturesRough) : ChartHistoryFutures {
        return {
            key: resp.key,
            requestId: resp["0"],
            prop1: resp["1"],
            count: resp["2"],
            candles: resp["3"].map(candle => StreamingUtils.transformChartHistoryFuturesCandle(candle))
        };
    }

    static transformChartHistoryFuturesCandle(candle: ChartHistoryFuturesCandleRough) : ICandle {
        return {
            datetime: candle["0"],
            open: candle["1"],
            high: candle["2"],
            low: candle["3"],
            close: candle["4"],
            volume: candle["5"]
        };
    }

    static transformTimeSaleResponse(timeSaleRough: TimeSaleRough) : TimeSale {
        return {
            key: timeSaleRough["key"],
            sequence: timeSaleRough["seq"],
            tradeTime: timeSaleRough["1"],
            lastPrice: timeSaleRough["2"],
            lastSize: timeSaleRough["3"],
            lastSequence: timeSaleRough["4"]
        };
    }

    static transformL1FuturesResponse(l1FuturesQuoteRough: L1FuturesQuoteRough, timestamp?: number) : L1FuturesQuote {
        return {
            // symbol and about info
            timestamp: timestamp, // from outer object
            key: l1FuturesQuoteRough["key"],
            symbol: l1FuturesQuoteRough["key"],
            description: l1FuturesQuoteRough["16"],
            tradingStatus: l1FuturesQuoteRough["22"],
            // "key": string, //symbol
            // "0"?: string, //symbol
            // "16"?: string, // description of product
            // "22"?: TRADING_STATUS, // symbolStatus
            futuresProduct: l1FuturesQuoteRough["27"], // "27"?: string, // futuresProduct
            tradingHours: l1FuturesQuoteRough["29"], // "29"?: string, // tradingHours
            isTradable: l1FuturesQuoteRough["30"], // "30"?: boolean, // isTradable

            // price info
            bid: l1FuturesQuoteRough["1"],
            ask: l1FuturesQuoteRough["2"],
            last: l1FuturesQuoteRough["3"],
            dailyOpen: l1FuturesQuoteRough["18"],
            dailyHigh: l1FuturesQuoteRough["12"],
            dailyLow: l1FuturesQuoteRough["13"],
            previousDayClose: l1FuturesQuoteRough["14"],
            mark: l1FuturesQuoteRough["24"],
            // "1"?: number, //bid
            // "2"?: number, //ask
            // "3"?: number, //last
            // "12"?: number, // dailyHigh
            // "13"?: number, // dailyLow
            // "14"?: number, // prevDayClose
            // "18"?: number, // dailyOpen
            // "24"?: number, // mark
            settlementPrice: l1FuturesQuoteRough["33"], // "33"?: number, // settlementPrice

            // info derived from price
            netChange: l1FuturesQuoteRough["19"],
            // "19"?: number, // netChange
            percentChange: l1FuturesQuoteRough["20"], // "20"?: number, // pctChange

            // volume info
            bidSize: l1FuturesQuoteRough["4"],
            askSize: l1FuturesQuoteRough["5"],
            lastSize: l1FuturesQuoteRough["9"],
            dailyVolume: l1FuturesQuoteRough["8"],
            // "4"?: number, //bidSize
            // "5"?: number, //askSize
            // "8"?: number, // dailyVolume
            // "9"?: number, // lastSize
            openInterest: l1FuturesQuoteRough["23"], // "23"?: number, // openInterest

            // contract info
            tickSize: l1FuturesQuoteRough["25"], // "25"?: number, // tickSize
            tickAmount: l1FuturesQuoteRough["26"], // "26"?: number, // tickAmount
            priceFormat: l1FuturesQuoteRough["28"], // "28"?: string, // priceFormat fraction or decimal
            multiplier: l1FuturesQuoteRough["31"], // "31"?: number, // contractMultiplier
            isContractActive: l1FuturesQuoteRough["32"], // "32"?: boolean, // isContractActive
            activeContractSymbol: l1FuturesQuoteRough["34"], // "34"?: string, // activeContractSymbol
            contractExpirationMSEpoch: l1FuturesQuoteRough["35"], // "35"?: number, // contractExpirationDate ms since epoch

            // exchanges
            exchangeOfPrimaryListing: l1FuturesQuoteRough["15"], // "15"?: EXCHANGES, // exchangeId
            exchangeBestAsk: l1FuturesQuoteRough["6"], // "6"?: EXCHANGES, // bestAskExchange
            exchangeBestBid: l1FuturesQuoteRough["7"], // "7"?: EXCHANGES, // bestBidExchange
            exchangeLastTrade: l1FuturesQuoteRough["17"], // "17"?: EXCHANGES, // lastTradeExchange
            exchangeName: l1FuturesQuoteRough["21"], // "21"?: string, // exchangeName

            // time info
            timeLastQuote: l1FuturesQuoteRough["10"],
            timeLastTrade: l1FuturesQuoteRough["11"],
            // "10"?: number, // lastQuoteTime ms since epoch
            // "11"?: number, // lastTradeTime ms since epoch

            // metadata
            delayed: l1FuturesQuoteRough.delayed,

        };
    }

    static transformL1FuturesOptionsResponse(l1FutOptRough: L1FuturesOptionsQuoteRough, timestamp: number) : L1FuturesOptionsQuote {
        return {
            timestamp: timestamp,
            key: l1FutOptRough["0"],
            symbol: l1FutOptRough["0"], // "0": string, // symbol
            description: l1FutOptRough["16"], // "16": string, // description
            tradingStatus: l1FutOptRough["22"], // "22": TRADING_STATUS, // security trading status: Normal, Halted, Closed

            // price
            bid: l1FutOptRough["1"], // "1": number, // bid price
            ask: l1FutOptRough["2"], // "2": number, // ask price
            last: l1FutOptRough["3"], // "3": number, // last trade price
            dailyHigh: l1FutOptRough["12"], // "12": number, // daily high
            dailyLow: l1FutOptRough["13"], // "13": number, // daily low
            dailyOpen: l1FutOptRough["18"], // "18": number, // daily open
            previousDayClose: l1FutOptRough["14"], // "14": number, // prev day close
            mark: l1FutOptRough["24"], // "24": number, // mark
            // --
            settlementPrice: l1FutOptRough["33"], //"33": number, // closing / settlement price

            // derived from price
            netChange: l1FutOptRough["19"], // "19": number, // net change, current last - prev close
            // --
            percentChange: l1FutOptRough["20"], // "20": number, // percent change

            // volume
            bidSize: l1FutOptRough["4"], // "4": number, // bid size
            askSize: l1FutOptRough["5"], // "5": number, // ask size
            dailyVolume: l1FutOptRough["8"], // "8": number, // total volume
            lastSize: l1FutOptRough["9"], // "9": number, // last size
            // --
            openInterest: l1FutOptRough["23"], // "23": number, // open interest

            // exchange
            // --
            exchangeBestAsk: l1FutOptRough["6"], // "6": EXCHANGES, // exchange with best ask
            exchangeBestBid: l1FutOptRough["7"], // "7": EXCHANGES, // exchange with best bid
            exchangeOfPrimaryListing: l1FutOptRough["15"], // "15": EXCHANGES, // primary listing exchange
            exchangeLastTrade: l1FutOptRough["17"], // "17": EXCHANGES, // last trade exchange
            exchangeName: l1FutOptRough["21"], // "21": string, // name of exchange

            // time
            timeLastQuote: l1FutOptRough["10"], // "10": number, // quote time ms epoch
            timeLastTrade: l1FutOptRough["11"], // "11": number, // trade time ms epoch


            // contract/product info
            // --
            tickSize: l1FutOptRough["25"], // "25": number, // tick, min price movement
            tickAmount: l1FutOptRough["26"], // "26": number, // tick amt, min amt of change (tick * multiplier)
            futuresProduct: l1FutOptRough["27"], // "27": string, // product (futures product)
            priceFormat: l1FutOptRough["28"], // "28": string, // price format (fraction or decimal)
            tradingHours: l1FutOptRough["29"], // "29": string, // trading hours
            isTradable: l1FutOptRough["30"], // "30": boolean, // is tradeable
            multiplier: l1FutOptRough["31"], // "31": number, // point value / multiplier
            isContractActive: l1FutOptRough["32"], // "32": boolean, // is contract active
            activeContractSymbol: l1FutOptRough["34"], // "34": string, // symbol of active contract
            contractExpirationMSEpoch: l1FutOptRough["35"], // "35": number, // expiration date of this contract, ms since epoch
        };
    }

    static transformL1OptionsResponse(l1OptionsRough: L1OptionsQuoteRough, timestamp: number) : L1OptionsQuote {
        return {
            timestamp: timestamp,
            key: l1OptionsRough["0"],
            symbol: l1OptionsRough["0"], // "0": string, // symbol
            description: l1OptionsRough["1"], // "1": string, // description, company, index, fund name
            tradingStatus: l1OptionsRough["37"], // "37": TRADING_STATUS, // trading status
            // --
            underlyingPrice: l1OptionsRough["39"], // "39": number, // underlying price

            // price
            bid: l1OptionsRough["2"],
            ask: l1OptionsRough["3"],
            last: l1OptionsRough["4"],
            dailyOpen: l1OptionsRough["19"],
            dailyHigh: l1OptionsRough["5"],
            dailyLow: l1OptionsRough["6"],
            previousDayClose: l1OptionsRough["7"],
            mark: l1OptionsRough["41"],
            // "2": number, // bid
            // "3": number, // ask
            // "4": number, // last
            // "5": number, // daily high
            // "6": number, // daily low
            // "7": number, // prev day close
            // "19": number, // daily open
            // "41": number, // mark

            // derived from price
            netChange: l1OptionsRough["23"], // "23": number, // net change, last - prev close
            intrinsicValues: l1OptionsRough["13"], // "13": number, // intrinsic value
            volatility: l1OptionsRough["10"], // "10": number, // volatility
            timeValue: l1OptionsRough["29"], // "29": number, // time value
            delta: l1OptionsRough["32"], // "32": number, // delta
            gamma: l1OptionsRough["33"], // "33": number, // gamma
            theta: l1OptionsRough["34"], // "34": number, // theta
            vega: l1OptionsRough["35"], // "35": number, // vega
            rho: l1OptionsRough["36"], // "36": number, // rho
            theoreticalOptionValue: l1OptionsRough["38"], // "38": number, // theoretical option value

            // volume
            bidSize: l1OptionsRough["20"],
            askSize: l1OptionsRough["21"],
            lastSize: l1OptionsRough["22"],
            dailyVolume: l1OptionsRough["8"],
            // "8": number, // total volume
            // "20": number, // bid size
            // "21": number, // ask size
            // "22": number, // last size
            openInterest: l1OptionsRough["9"], // "9": number, // open interest

            // time
            timeLastQuote: null, // TODO: use moment to flesh out?
            timeLastTrade: null, // TODO: use moment to flesh out?
            timeLastQuoteSecsFromMidnight: l1OptionsRough["11"],
            timeLastTradeSecsFromMidnight: l1OptionsRough["12"],
            // "11": number, // quote time since, sec since midnight
            // "12": number, // trade time, sec since midnight
            quoteDay: l1OptionsRough["14"], // "14": number, // quote day (day of month?)
            tradeDay: l1OptionsRough["15"], // "15": number, // trade day (day of month?)


            // contract info
            multiplier: l1OptionsRough["17"], // "17": number, // contract multiplier
            validDigits: l1OptionsRough["18"], // "18": number, // valid decimal digits
            strikePrice: l1OptionsRough["24"], // "24": number, // strike price
            contractType: l1OptionsRough["25"], // "25": string, // contract type (standard, non-standard?)
            underlying: l1OptionsRough["26"], // "26": string, // underyling
            expirationMonth: l1OptionsRough["27"], // "27": number, // expiration month (0 based?)
            deliverables: l1OptionsRough["28"], // "28": string, // deliverables
            expirationDay: l1OptionsRough["30"], // "30": number, // expiration day
            daysTilExpiration: l1OptionsRough["31"], // "31": number, // days to expiry
            uvExpirationType: l1OptionsRough["40"], // "40": string, // uv expiration type (american/european?)
            expirationYear: l1OptionsRough["16"], // "16": number, // expiration year
        };
    }

    static transformL1EquitiesResponse(l1EquityRough: L1EquityQuoteRough, timestamp: number) : L1EquityQuote {
        return {
            timestamp: timestamp,
            // symbol and about info
            key: l1EquityRough.key,
            symbol: l1EquityRough.key,
            description: l1EquityRough["25"],
            tradingStatus: l1EquityRough["48"],
            // "0": string, // symbol
            // "25": string, // description: company, index, or fund name
            // "48": TRADING_STATUS, // security status: Normal, Halted, Closed
            peRatio: l1EquityRough["32"], // "32": number, // PE ratio
            dividendAmount: l1EquityRough["33"], // "33": number, // dividend amount
            dividendYield: l1EquityRough["34"], // "34": number, // dividend yield
            dividendDate: l1EquityRough["40"], // "40": string, // dividend date

            // price info
            bid: l1EquityRough["1"],
            ask: l1EquityRough["2"],
            last: l1EquityRough["3"],
            dailyOpen: l1EquityRough["28"],
            dailyHigh: l1EquityRough["12"],
            dailyLow: l1EquityRough["13"],
            previousDayClose: l1EquityRough["15"],
            mark: l1EquityRough["49"],
            // "1": number, // bid price
            // "2": number, // ask price
            // "3": number, // last price
            // "12": number, // daily high price
            // "13": number, // daily low price
            // "28": number, // day open price
            // "15": number, // prev day's close
            // "49": number, // mark
            fiftyTwoWeekHigh: l1EquityRough["30"], // "30": number, // 52wk high
            fiftyTwoWeekLow: l1EquityRough["31"], // "31": number, // 52wk low
            fundPrice: l1EquityRough["38"], // "38": number, // fund price
            regularMarketLastPrice: l1EquityRough["43"], // "43": number, // regular market last price

            // info derived from price
            netChange: l1EquityRough["29"],
            // "29": number, // net change, last-prev close
            volatility: l1EquityRough["24"], // "24": number, // volatility
            NAV: l1EquityRough["37"], // "37": number, // NAV - mutual fund net asset value
            bidTickDirection: l1EquityRough["14"], // "14": string, // bid tick, up or down
            validDigits: l1EquityRough["27"], // "27": number, // digits ??? (number of valid decimal points?)
            regularMarketNetchange: l1EquityRough["47"], // "47": number, // reg market net change

            // volume info
            bidSize: l1EquityRough["4"],
            askSize: l1EquityRough["5"],
            lastSize: l1EquityRough["9"],
            dailyVolume: l1EquityRough["8"],
            // "4": number, // bid size
            // "5": number, // ask size
            // "8": number, // volume
            // "9": number, // last size, in 100s
            regularMarketLastSize: l1EquityRough["44"], // "44": number, // reg last size

            // exchanges
            exchangeBestAsk: l1EquityRough["6"], // "6": EXCHANGES, // ask exchange id
            exchangeBestBid: l1EquityRough["7"], // "7": EXCHANGES, // bid exchange id
            exchangeOfPrimaryListing: l1EquityRough["16"], // "16": EXCHANGES, // primary listing exchange, type EXCHANGES
            exchangeLastTrade: l1EquityRough["26"], // "26": EXCHANGES, // last id for exchange
            exchangeName: l1EquityRough["39"], // "39": string, // exchange name



            // trade info
            isMarginable: l1EquityRough["17"], // "17": boolean, // marginable
            isShortable: l1EquityRough["18"], // "18": boolean, // shortable
            isLastQuoteFromRegularMarket: l1EquityRough["41"], // "41": boolean, // is last quote regular market quote
            isLastTradeFromRegularMarket: l1EquityRough["42"], // "42": boolean, // regular market trade


            // time info
            timeLastQuote: l1EquityRough["50"],
            timeLastTrade: l1EquityRough["51"],
            // "50": number, // quote time ms since epoch
            // "51": number, // trade time ms since epoch
            lastRegularMarketTradeTimeMSEpoch: l1EquityRough["52"], // "52": number, // reg mkt trade time ms epoch
            quoteDay: l1EquityRough["22"], // "22": number, // quote day (day of the month?)
            tradeDay: l1EquityRough["23"], // "23": number, // trade day
            lastRegularMarketTradeTimeSecsFromMidnight: l1EquityRough["45"], // "45": number, // reg trade time
            lastRegularMarketTradeDay: l1EquityRough["46"], // "46": number, // reg market trade day
            lastTradeTimeSecsFromMidnight: l1EquityRough["10"], // "10": number, // trade time, seconds since midnight EST
            lastQuoteTimeSecsFromMidnight: l1EquityRough["11"], // "11": number, // quote time, seconds since midnight EST


            // island
            islandBidSize: l1EquityRough["35"], // "35": number, // island bid size NOT USED
            islandAskSize: l1EquityRough["36"], // "36": number, // island ask size NOT USED
            islandBid: l1EquityRough["19"], // "19": number, // island bid NOT USED
            islandAsk: l1EquityRough["20"], // "20": number, // island ask NOT USED
            islandVolume: l1EquityRough["21"], // "21": number, // island volume NOT USED
        };
    }

    static transformL1ForexResponse(l1ForexRough: L1ForexQuoteRough, timestamp: number) : L1ForexQuote {
        return {
            timestamp: timestamp,
            key: l1ForexRough["0"],
            symbol: l1ForexRough["0"],
            description: l1ForexRough["14"],
            tradingStatus: l1ForexRough["20"],
            // "0": string, // ticker symbol in upper case
            // "14": string, // description
            // "20": TRADING_STATUS, // trading status
            productName: l1ForexRough["23"], // "23": string, // product name
            tradingHours: l1ForexRough["24"], // "24": string, // trading hours
            isTradable: l1ForexRough["25"], // "25": boolean, // is tradable
            marketMaker: l1ForexRough["26"], // "26": string, // market maker

            // price
            bid: l1ForexRough["1"],
            ask: l1ForexRough["2"],
            last: l1ForexRough["3"],
            dailyOpen: l1ForexRough["15"],
            dailyHigh: l1ForexRough["10"],
            dailyLow: l1ForexRough["11"],
            previousDayClose: l1ForexRough["12"],
            mark: l1ForexRough["29"],
            // "1": number, // current best bid price
            // "2": number, // current ask
            // "3": number, // last trade
            // "10": number, // high price
            // "11": number, // low price
            // "12": number, // prev day close
            // "15": number, // day's open price
            // "29": number, // mark
            fiftyTwoWeekHigh: l1ForexRough["27"], // "27": number, // 52wk high
            fiftyTwoWeekLow: l1ForexRough["28"], // "28": number, // 52wk low


            // derived from price
            netChange: l1ForexRough["16"],
            // "16": number, // net change last - prev close
            percentChange: l1ForexRough["17"], // "17": number, // percent change

            // volume
            bidSize: l1ForexRough["4"],
            askSize: l1ForexRough["5"],
            lastSize: l1ForexRough["7"],
            dailyVolume: l1ForexRough["6"],
            // "4": number, // bid size
            // "5": number, // ask size
            // "6": number, // volume
            // "7": number, // last size

            // time
            timeLastQuote: l1ForexRough["8"],
            timeLastTrade: l1ForexRough["9"],
            // "8": number, // quote time ms epoch
            // "9": number, // trade time ms epoch

            // exchange
            exchangeOfPrimaryListing: l1ForexRough["13"], // "13": EXCHANGES, // primary listing exchange
            exchangeName: l1ForexRough["18"], // "18": string, // exchange name

            // contract/product info
            validDigits: l1ForexRough["19"], // "19": number, // valid decimal digits
            tickSize: l1ForexRough["21"], // "21": number, // tick, min price movement
            tickAmount: l1ForexRough["22"], // "22": number, // tick amount, tick*multiplier
        };
    }

    static transformNewsHeadlineResponse(newsHeadlineRough: NewsHeadlineRough, timestamp: number) : NewsHeadline {
        return {
            timestamp: timestamp,
            sequence: newsHeadlineRough.seq,
            key: newsHeadlineRough.key,
            symbol: newsHeadlineRough.key,
            errorCode: newsHeadlineRough["1"],
            storyDatetime: newsHeadlineRough["2"],
            headlineId: newsHeadlineRough["3"],
            status: newsHeadlineRough["4"],
            headline: newsHeadlineRough["5"],
            storyId: newsHeadlineRough["6"],
            keywordCount: newsHeadlineRough["7"],
            keywords: newsHeadlineRough["8"],
            isHot: newsHeadlineRough["9"],
            storySource: newsHeadlineRough["10"],
        };
    }

    static transformAcctActivityResponse(acctActivityRough: AcctActivityRough, timestamp: number) : AcctActivity {
        return {
            timestamp: timestamp,
            accountNumber: acctActivityRough["1"],
            messageType: acctActivityRough["2"],
            messageData: flatten(convert.xml2js(acctActivityRough["3"], {compact:true, textKey:"parsedXmlText"})), // xml
            key: acctActivityRough.key, // subscription key
            sequence: acctActivityRough.seq, // sequence number
        };
    }

    static identityFunction(a: any) : any {
        return a;
    }
}

function flatten(obj: any) {
    if (typeof(obj) === "object") {
        for (const a in obj) {
            if (typeof(obj[a]) === "object") {
                if (Object.keys(obj[a]).length === 1 && Object.keys(obj[a])[0] === "parsedXmlText") {
                    obj[a] = obj[a]["parsedXmlText"];
                } else {
                    flatten(obj[a]);
                }
            }
        }
    }
    return obj;
}
