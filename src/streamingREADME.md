# How to Get Started with Streaming
[Link back to main README](README.md)

Declare an instance of the TDADataStream class, call the login function, call a subscribe function, stream.

It is almost that easy. I'll get  you started with some sample code. This emits events, and you have to subscribe to the events to get the data (with a couple exceptions).

Other than that, read the documentation on the individual methods. Check out the types in the streamingdatatypes file.

## CONTENTS
- [THE BASICS](#the-basics)
- [SERVICES AND COMMANDS](#services-and-commands)
- [BASIC CONCEPT AND USAGE](#basic-concept-and-usage)
- [TDA DOCUMENTATION](#tda-documentation)
- [FULLY WORKED EXAMPLE](#fully-worked-example)


## THE BASICS
1. Call the constructor. You must pass in the authConfig. The other 7 inputs are optional, with the defaults shown below.
```js
const tdaapiclient = require('tda-api-client');
const streamConfig = {
   authConfig: {
     "refresh_token": "token_here",
     "client_id": "replace_me@AMER.OAUTHAP",
   },
   emitDataRaw: false,
   emitDataBySubRaw: false,
   emitDataBySubTyped: false,
   emitDataBySubAndTickerRaw: false,
   emitDataBySubAndTickerTyped: true,
   retryAttempts: 3,
   retryIntervalSeconds: 60,
};

const stream = new tdaapiclient.streaming.TDADataStream(streamConfig);
```

2. Set up your basic data stream subscriptions. There are 4 top-level event subscriptions and 4 other possible event subscriptions for each streaming sub.
The 4 top-level events are:
   - heartbeat : A periodic, about every 15 seconds, stream event from TDA
   - response : Used to acknowledge a connection, new subscription, or QOS change
   - data : The streaming data
   - snapshot : This is for one-time data requests, such as CHART_HISTORY_FUTURES

Here is an example event subscriptions. It is quite possible you won't subscribe to these. If you set streamConfig.emitDataRaw to TRUE, then you need to subscribe to the "data" event to get the raw output
```js
stream.on('response', (args) => handleResponse(args));
```
In practice, you might only subscribe to heartbeat to let you know the connection is still alive and perhaps response to confirm data subscriptions or admin commands were successful.
The others, data and snapshot, are pretty coarse and you may want to subscribe to a more granular event, as described next.

3. Prepare an event subscription for the subscription you want. For each data subscription, you can subscribe to up to 4 data return formats.
- {sub}_RAW : use streamConfig.emitDataBySubRaw to make this data get emitted. This will emit all the data for all tickers you've subscribed to for this subscription type.
- {sub}_RAW\_{symbol} : use streamConfig.emitDataBySubAndTickerRaw to make this data get emitted. It will be symbol specific, so you will need to subscribe to possibly many events.
- {sub}_TYPED : use streamConfig.emitDataBySubTyped to make this data get emitted. This will emit all the data for all tickers for the particular subscription, but the object fields will be named.
- {sub}_TYPED\_{symbol} : use streamConfig.emitDataBySubAndTickerTyped to make this data get emitted. It will be ticker specfiic, and the fields will be named.

The symbol that is used as part of the emitted event is a normalized string. You can access this method with tdaclient.StreamingUtils.normalizeSymbol(), e.g.:
```js
const ticker = '/ES';
const normalizedTicker = tdaapiclient.streaming.StreamingUtils.normalizeSymbol(ticker); // "_ES"
```

Here is an example of how you could subscribe to the various data streams if you had them all turned on and you were about to subscribe to Level One Futures for /ES and /NQ.
```js
const tickerES = '/ES';
const normalizedTickerES = tdaapiclient.streaming.StreamingUtils.normalizeSymbol(tickerES); // "_ES"
const tickerNQ = '/ES';
const normalizedTickerNQ = tdaapiclient.streaming.StreamingUtils.normalizeSymbol(tickerNQ); // "_NQ"
stream.on('LEVELONE_FUTURES_RAW', (args) => console.log('all the faw L1 Futures data from this tick', JSON.stringify(args, null, 2)));
stream.on(`LEVELONE_FUTURES_RAW_${normalizedTickerES}`, (args) => console.log('raw /ES data', JSON.stringify(args, null, 2)));
stream.on(`LEVELONE_FUTURES_RAW_${normalizedTickerNQ}`, (args) => console.log('raw /NQ data', JSON.stringify(args, null, 2)));
stream.on('LEVELONE_FUTURES_TYPED', (args) => console.log('all the L1 futures data from this tick, but typed', JSON.stringify(args, null, 2)));
stream.on(`LEVELONE_FUTURES_TYPED_${normalizedTickerES}`, (args) => console.log('typed /ES data', JSON.stringify(args, null, 2)));
stream.on(`LEVELONE_FUTURES_TYPED_${normalizedTickerNQ}`, (args) => console.log('typed /NQ data', JSON.stringify(args, null, 2)));
```

4. Now call the subscription method.
```js
stream.genericStreamRequest({
   service: tdaapiclient.streaming.SERVICES.LEVELONE_FUTURES,
   command: tdaapiclient.streaming.COMMANDS.SUBS,
   parameters: {
        keys: '/NQ,/ES'
   }
});
```

## SERVICES AND COMMANDS
### The Basic Commands
```js
// config
getConfig()
setConfig()

// stream admin
doDataStreamLogin()
doDataStreamLogout()
qosRequest()

// stream data requests
genericStreamRequest()
accountUpdatesSub()

// special functions for certain one-time data requests
chartHistoryFuturesGet()
```
###Important Enums
Services and commands are accessible in enums.
Commands are: tdaapiclient.streaming.COMMANDS
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
Services are: tdaapiclient.streaming.SERVICES

Generally speaking, the services are for subscription data. Here are the Services grouped according to their access pattern:
```bash
| SUBS, ADD, UNSUBS
| ------------------
| CHART_EQUITY
| CHART_FUTURES
|
| QUOTE
| LEVELONE_FUTURES
| LEVELONE_FOREX
| LEVELONE_FUTURES_OPTIONS
| OPTION
|
| TIMESALE_EQUITY
| TIMESALE_FUTURES
| TIMESALE_FOREX
| TIMESALE_OPTIONS
|
| ACCT_ACTIVITY
|
| NEWS_HEADLINE
====================

| GET
| ------------------
| ACTIVES_NASDAQ
| ACTIVES_NYSE
| ACTIVES_OTCBB
| ACTIVES_OPTIONS
| CHART_HISTORY_FUTURES
====================

| NONE OF THE ABOVE
| -----------------
| ADMIN
====================

| DOES THIS EVEN WORK?
| --------------------
| (SUBS?)
| LEVELTWO_FUTURES
| FOREX_BOOK
| FUTURES_BOOK
| LISTED_BOOK
| NASDAQ_BOOK
| OPTIONS_BOOK
| FUTURES_OPTIONS_BOOK
|
| (GET?)
| NEWS_HEADLINE_LIST
| NEWS_STORY
|
| STREAMER_SERVER (???)
====================
```

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
stream.genericStreamRequest({
   service: tdaapiclient.streaming.SERVICES.QUOTE,
   command: tdaapiclient.streaming.COMMANDS.SUBS,
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
const normalizedTickerES = tdaapiclient.streaming.StreamingUtils.normalizeSymbol('/ES'); // "_ES"
stream.once(`CHART_HISTORY_FUTURES_TYPED_${normalizedTickerES}`, (args: any) => console.log(`chart history futures typed for /ES`, JSON.stringify(args, null, 2)));
stream.chartHistoryFuturesGet('/ES', tdaapiclient.streaming.CHART_HISTORY_FUTURES_FREQUENCY.DAY_ONE, 'w2');
```

## TDA DOCUMENTATION
The official link for the streaming documentation is here: https://developer.tdameritrade.com/content/streaming-data

I've also saved this locally as txt (for grepping!). [TXT file](./apidocsarchive/streamingdata/streamdata.txt)

## FULLY WORKED EXAMPLE

```js
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

const stream = new TDADataStream(streamConfig);

stream.on('heartbeat', (args) => console.log('heartbeat', JSON.stringify(args, null, 2)));
stream.on('response', (args) => console.log('response', JSON.stringify(args, null, 2)));

stream.once('response', (args) => {
   stream.on('LEVELONE_FUTURES_TYPED__ES', (args: any) => console.log('l1fut typed es', JSON.stringify(args, null, 2)));
   stream.genericStreamRequest({
      service: SERVICES.LEVELONE_FUTURES,
      command: COMMANDS.SUBS,
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