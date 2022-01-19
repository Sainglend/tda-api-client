# How to Get Started with Streaming
[Link back to main README](README.md)

Declare an instance of the StreamDataTDA class, call the login function, call a subscribe function, stream.

It is almost that easy. I'll get you started with some sample code. This emits events, and you have to subscribe to the events to get the data (with a couple exceptions).

Other than that, read the documentation on the individual methods. Check out the types in the streamingdatatypes file. Check out the unit tests in the github repo, https://www.github.com/sainglend/tda-api-client . Eventually, I'll put up full examples for each Service in the samples/ folder in the github repo.

## CONTENTS
- [THE BASICS](#the-basics)
- [SERVICES AND COMMANDS](#services-and-commands)
- [BASIC CONCEPT AND USAGE](#basic-concept-and-usage)
- [TDA DOCUMENTATION](#tda-documentation)
- [FULLY WORKED EXAMPLE](#fully-worked-example)


## THE BASICS
1. Call the constructor. You must pass in the authConfig. The other inputs are optional, with the defaults shown below.
```typescript
import {StreamDataTDA, IStreamDataTDAConfig} from "tda-api-client";

const streamConfig: IStreamDataTDAConfig = {
   authConfig: {
     "refresh_token": "token_here",
     "client_id": "replace_me@AMER.OAUTHAP",
   },
   emitDataRaw: false,
   emitDataBySubRaw: false,
   emitDataBySubTyped: false,
   emitDataBySubAndTickerRaw: false,
   emitDataBySubAndTickerTyped: true,
   reconnectRetryIntervalSeconds: 60,
   verbose: false,
   debug: false,
   queueConfig: {
       minimumSpacingMS: 500,
       maximumSapcingMS: 1000,
   },
};

const tdaStream = new StreamDataTDA(streamConfig);
```

2. Set up your basic data stream subscriptions. There are 4 top-level event subscriptions and 4 other possible event subscriptions for each streaming sub.
The 4 top-level events are:
   - heartbeat : A periodic, about every 15 seconds, stream event from TDA
   - response : Used to acknowledge a connection, new subscription, or QOS change
   - data : The streaming data
   - snapshot : This is for one-time data requests, such as CHART_HISTORY_FUTURES

Here is an example event subscription. It is quite possible you won't subscribe to these. If you set streamConfig.emitDataRaw to TRUE, then you need to subscribe to the "data" event to get the raw output.
```js
stream.on('response', (args) => handleResponse(args));
```
In practice, you might only subscribe to `heartbeat` to let you know the connection is still alive and perhaps `response` to confirm data subscriptions or admin commands were successful.
The others, `data` and `snapshot`, are pretty coarse and you may want to subscribe to a more granular event, as described next.

3. The way this library was designed to be used was using the following events. Prepare an event subscription for the subscription you want. For each data subscription, you can subscribe to up to 4 data return formats.
- {sub}_RAW : use streamConfig.emitDataBySubRaw to make this data get emitted. This will emit all the data for all tickers you've subscribed to for this subscription type.
- {sub}_RAW\_{symbol} : use streamConfig.emitDataBySubAndTickerRaw to make this data get emitted. It will be symbol specific, so you will need to subscribe to possibly many events.
- {sub}_TYPED : use streamConfig.emitDataBySubTyped to make this data get emitted. This will emit all the data for all tickers for the particular subscription, but the object fields will be named.
- {sub}_TYPED\_{symbol} : use streamConfig.emitDataBySubAndTickerTyped to make this data get emitted. It will be ticker specfiic, and the fields will be named.

The symbol that is used as part of the emitted event is a normalized string. You can access this method with tdaclient.StreamingUtils.normalizeSymbol(), e.g.:
```js
import { normalizeSymbol } from "tda-api-client";
const ticker = '/ES';
const normalizedTicker = normalizeSymbol(ticker); // "_ES"
```

Here is an example of how you could subscribe to the various data streams if you had them all turned on and you were about to subscribe to Level One Futures for /ES and /NQ.
```typescript
import {EServices, normalizeSymbol, L1FuturesQuoteRough, L1FuturesQuote} from "tda-api-client";

const service = EServices.LEVELTWO_FUTURES;
const tickerES = '/ES';
const normalizedTickerES = normalizeSymbol(tickerES); // "_ES"
const tickerNQ = '/NQ';
const normalizedTickerNQ = normalizeSymbol(tickerNQ); // "_NQ"
stream.on(`${service}_RAW`, (args: L1FuturesQuoteRough[]) => console.log('all the faw L1 Futures data from this tick', JSON.stringify(args, null, 2)));
stream.on(`${service}_RAW_${normalizedTickerES}`, (args: L1FuturesQuoteRough) => console.log('raw /ES data', JSON.stringify(args, null, 2)));
stream.on(`${service}_RAW_${normalizedTickerNQ}`, (args: L1FuturesQuoteRough) => console.log('raw /NQ data', JSON.stringify(args, null, 2)));
stream.on(`${service}_TYPED`, (args: L1FuturesQuote[]) => console.log('all the L1 futures data from this tick, but typed', JSON.stringify(args, null, 2)));
stream.on(`${service}_TYPED_${normalizedTickerES}`, (args: L1FuturesQuote) => console.log('typed /ES data', JSON.stringify(args, null, 2)));
stream.on(`${service}_TYPED_${normalizedTickerNQ}`, (args: L1FuturesQuote) => console.log('typed /NQ data', JSON.stringify(args, null, 2)));
```
To note here is that the {service}_RAW and {service}_TYPED subscriptions only need to be subscribed to at the outset. All data will be returned as an array, which can be filtered by `.key` or `.symbol` (the same thing).

The recommended usage is to use `{service}_TYPED_{normalizedSymbol}` to get well-defined and typed return data.

4. Now call the subscription method. You can await this and capture the result, which will be the requestSeqNum.
```js
import {EServices, ECommands} from "tda-api-client";
const requestNumber = await tdaStream.genericStreamRequest({
   service: EServices.LEVELONE_FUTURES,
   command: ECommands.SUBS,
   parameters: {
        keys: '/NQ,/ES'
   }
});
```

5. Most calls can be queued, an optional functionality, as a way to avoid any implicit rate limits or at least stream issues. I've noticed that if I do multiple requests back-to-back, some don't receive a response. The queue can aid in spacing those out. Note the stream config parameters in the constructor config. Defaults for min and max times between requests are 500 and 1000ms.

## SERVICES AND COMMANDS
### The Basic Commands

These commands allow interaction with the stream. Stream requests, other than log in and log out, can be queued to avoid running up against problems. Though no explicit rate limit is stated, I've experienced issues from just submitting a second request before receiving acknowledgement of the first.
```js
// constructor
StreamDataTDA(streamConfig)

// config
getConfig()
setConfig(updateConfig)

// do a stream request with no helper methods
sendStreamRequest()

// stream admin
doDataStreamLogin()
doDataStreamLogout()
qosRequest()

// stream data requests
genericStreamRequest()
accountActivitySub()
accountActivityUnsub()

// special functions for certain one-time data requests
chartHistoryFuturesGet()

// queue management
queueClear()
queueInfo()
```
###Important Enums
Services and commands are accessible in enums.
Commands are: `ECommands`
```js
QOS
LOGIN
LOGOUT
SUBS
GET
UNSUBS
ADD
VIEW
STREAM
```
Services are: `EServices`

I've created types corresponding to most services, a type that models the raw data from TDA (objects with properties indexed like "0", "1", etc.) and a type with properly named properties ("bid", "ask", "lastTradeTime", etc.).
Generally speaking, the services are for subscription data. Here are the Services grouped according to their access pattern, along with their types:

** indicates no types yet created, so any event subscription will return the raw data

| SUBS, ADD, UNSUBS | Type                | Raw Type                   |
| ------------------ |---------------------|----------------------------|
| CHART_EQUITY | ChartEquityResponse | ChartEquityResponseRough   |
| CHART_FUTURES | ChartFuturesResponse | ChartFuturesResponseRough  |
| QUOTE | L1EquityQuote       | L1EquityQuoteRough         |
| LEVELONE_FUTURES | L1FuturesQuote      | L1FuturesQuoteRough        |
| LEVELONE_FOREX | L1ForexQuote        | L1ForexQuoteRough          |
| LEVELONE_FUTURES_OPTIONS | L1FuturesOptionsQuote | L1FuturesOptionsQuoteRough |
| OPTION | L1OptionsQuote      | L1OptionsQuoteRough        |
| TIMESALE_EQUITY | TimeSale            | TimeSaleRough              |
| TIMESALE_FUTURES | TimeSale            | TimeSaleRough              |
| TIMESALE_FOREX | TimeSale            | TimeSaleRough              |
| TIMESALE_OPTIONS | TimeSale            | TimeSaleRough              |
| ACCT_ACTIVITY | AcctActivity        | AcctActivityRough          |
| NEWS_HEADLINE | NewsHeadline        | NewsHeadlineRough          |

| GET | Type | Raw Type                 |
| ------------------ | --- |--------------------------|
| ACTIVES_NASDAQ | ** | **                       |
| ACTIVES_NYSE | ** | **                       |
| ACTIVES_OTCBB | ** | **                       |
| ACTIVES_OPTIONS | ** | **                       |
| CHART_HISTORY_FUTURES | ChartHistoryFutures | ChartHistoryFuturesRough |

| OTHER SERVICES | Type |
| ----------------- |-----|
| ADMIN | IStreamResponse    |

The services below I haven't been able to personally verify, and they don't even have TDA documentation.


| DOES THIS EVEN WORK? | Usage? |
| -------------------- |--------|
| FOREX_BOOK | SUBS?  |
| FUTURES_BOOK | SUBS?  |
| LISTED_BOOK | SUBS?  |
| NASDAQ_BOOK | SUBS?  |
| OPTIONS_BOOK | SUBS?  |
| FUTURES_OPTIONS_BOOK | SUBS?  |
| NEWS_HEADLINE_LIST | GET?   |
| NEWS_STORY | GET?   |
| STREAMER_SERVER | (???)  |


## BASIC CONCEPT AND USAGE
### SUBS, ADD, UNSUBS
Most services follow this pattern. Initially you SUBS. Any subsequent SUBS command to the same service overwrites a previous SUBS. ADD will add on to your previous SUBS. UNSUBS can be used to remove some or all.

For example, here is a pseudo-code example for QUOTE, which is Level 1 data for stocks.
```js
QUOTE, SUBS, "TSLA,MSFT"
// now subbed to TSLA, MSFT

QUOTE, ADD, "T"
// now subbed to TSLA, MSFT, T

QUOTE, SUBS, "FB,AMZN,AAL"
// now only subbed to FB, AMZN, AAL

QUOTE, UNSUBS, "FB"
// now subbed to AMZN, AAL

QUOTE, UNSUBS
// request ended
```
To actually execute those, after registering an event listener, you would call genericStreamRequest, like so:
```js
await stream.genericStreamRequest({
   service: EServices.QUOTE,
   command: ECommands.SUBS,
   parameters: {
        keys: 'TSLA,MSFT'
   }
});
```
### GET
It is likely that some of the commands in my "Does this even work?" section use GET, but that is to be determined. For now, the one case I am certain of has particular input so it gets its own method.
The method is documented, but the most basic usage is to pass in a symbol, a candle size, and a time period. The frequencies (candle sizes) are in an enum, but the period is a string, with a letter denoting the type, like d for day, w for week, followed by a number. Here I'm using w2 for two weeks.

Just like the other data, you need to register an event listener. Once should suffice.
```js
const normalizedTickerES = normalizeSymbol('/ES'); // "_ES"
stream.once(`CHART_HISTORY_FUTURES_TYPED_${normalizedTickerES}`, (args: any) => console.log(`chart history futures typed for /ES`, JSON.stringify(args, null, 2)));
stream.chartHistoryFuturesGet('/ES', EChartHistoryFuturesFrequency.DAY_ONE, 'w2');
```

## TDA DOCUMENTATION
The official link for the streaming documentation is here: https://developer.tdameritrade.com/content/streaming-data

I've also saved this locally as txt (for grepping!). [TXT file](./apidocsarchive/streamingdata/streamdata.txt)

## FULLY WORKED EXAMPLE
### TypeScript
```typescript
import {ECommands, EServices, IStreamDataTDAConfig, StreamDataTDA,
   normalizedSymbol, IStreamNotify, IStreamResponse, L1FuturesQuote,
   IGenericStreamConfig} from "tda-api-client";

const streamConfig: IStreamDataTDAConfig = {
   authConfig: {
      "refresh_token": "token_thingy",
      "client_id": "myid@AMER.OAUTHAP",
   },
   emitDataBySubAndTickerRaw: false,
   emitDataBySubAndTickerTyped: false,
   emitDataBySubRaw: false,
   emitDataBySubTyped: false,
   emitDataRaw: true,
};

const tdaStream = new StreamDataTDA(streamConfig);
const service = EServices.LEVELONE_FUTURES;
const symbol: string = '/ES';
const normalizedSymbol: string = normalizedSymbol(symbol);

tdaStream.on('heartbeat', (args: IStreamNotify[]) => console.log('heartbeat', JSON.stringify(args, null, 2)));
tdaStream.on('response', (args: IStreamResponse[]) => console.log('response', JSON.stringify(args, null, 2)));
tdaStream.on(`${service}_TYPED_${normalizedSymbol}`, (args: L1FuturesQuote) => console.log('l1fut typed es', JSON.stringify(args, null, 2)));

tdaStream.once('response', (args: IStreamResponse[]) => {
    const requestConfig: IGenericStreamConfig = {
        service: EServices.LEVELONE_FUTURES,
        command: ECommands.SUBS,
        parameters: {
           keys: '/NQ',
        }
    };
    tdaStream.genericStreamRequest(requestConfig);
});

await tdaStream.doDataStreamLogin();
```
### JavaScript
```js
import {ECommands, EServices, StreamDataTDA, normalizedSymbol} from "tda-api-client";


const streamConfig = {
   authConfig: {
      "refresh_token": "token_thingy",
      "client_id": "myid@AMER.OAUTHAP",
   },
   emitDataBySubAndTickerRaw: false,
   emitDataBySubAndTickerTyped: false,
   emitDataBySubRaw: false,
   emitDataBySubTyped: false,
   emitDataRaw: true
};

const tdaStream = new StreamDataTDA(streamConfig);
const service = EServices.LEVELONE_FUTURES;
const symbol = '/ES';
const normalizedSymbol = normalizedSymbol(symbol);

tdaStream.on('heartbeat', (args) => console.log('heartbeat', JSON.stringify(args, null, 2)));
tdaStream.on('response', (args) => console.log('response', JSON.stringify(args, null, 2)));
tdaStream.on(`${service}_TYPED_${normalizedSymbol}`, (args) => console.log('l1fut typed es', JSON.stringify(args, null, 2)));

stream.once('response', (args) => {
   stream.genericStreamRequest({
      service: EServices.LEVELONE_FUTURES,
      command: ECommands.SUBS,
      parameters: {
         keys: '/NQ',
      }
   });
});

await stream.doDataStreamLogin();
```

###OUTPUT
First you'll see the response from the login. Then you'll see the first heartbeat. Then I start receiving /ES data, the first being a dump of all fields, then after that just the fields that have updated data to report.
```js
[
   {
      service: 'ADMIN',
      requestid: '0',
      command: 'LOGIN',
      timestamp: 1617947832771,
      content: { code: 0, msg: '30-4' }
   }
]


[ { heartbeat: '1617947832856' } ]

[
    {
        service: 'LEVELONE_FUTURES',
        requestid: '1',
        command: 'SUBS',
        timestamp: 1617947832856,
        content: { code: 0, msg: 'SUBS command succeeded' }
    }
]


{
  "timestamp": 1617947832869,
  "key": "/ES",
  "symbol": "/ES",
  "description": "E-mini S&P 500 Index Futures,Jun-2021,ETH",
  "tradingStatus": "Unknown",
  "futuresProduct": "/ES",
  "tradingHours": "GLBX(de=1640;0=-1700151515301600;1=r-17001515r15301600d-15551640;7=d-16401555)",
  "isTradable": true,
  "bid": 4089.75,
  "ask": 4090,
  "last": 4090,
  "dailyOpen": 4098,
  "dailyHigh": 4102.5,
  "dailyLow": 4087,
  "previousDayClose": 4089,
  "mark": 4090,
  "settlementPrice": 4089,
  "netChange": 1,
  "percentChange": 0.0002,
  "bidSize": 12,
  "askSize": 33,
  "lastSize": 1,
  "dailyVolume": 70024,
  "openInterest": 2610556,
  "tickSize": 0.25,
  "tickAmount": 12.5,
  "priceFormat": "D,D",
  "multiplier": 50,
  "isContractActive": true,
  "activeContractSymbol": "/ESM21",
  "contractExpirationMSEpoch": 1623988800000,
  "exchangeOfPrimaryListing": "E",
  "exchangeBestAsk": "?",
  "exchangeBestBid": "?",
  "exchangeLastTrade": "?",
  "exchangeName": "XCME",
  "timeLastQuote": 1617947830854,
  "timeLastTrade": 1617947830679,
  "delayed": false
}


{
   "timestamp": 1617947833896,
   "key": "/ES",
   "symbol": "/ES",
   "bidSize": 18,
   "askSize": 25,
   "timeLastQuote": 1617947833355
}


{
   "timestamp": 1617947834920,
   "key": "/ES",
   "symbol": "/ES",
   "bidSize": 20,
   "askSize": 24,
   "dailyVolume": 70025,
   "timeLastQuote": 1617947834501,
   "timeLastTrade": 1617947834392
}
```