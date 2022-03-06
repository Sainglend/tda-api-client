
# TDA API CLIENT
https://www.github.com/sainglend/tda-api-client

v2.1.3
## Summary
This library is a client to use the API exposed by TD Ameritrade at https://developer.tdameritrade.com
This project can also be used as a sort of command line utility.

TO REFER BACK TO V1.2 documentation, visit [https://github.com/sainglend/tda-api-client/tree/v1_2](https://github.com/sainglend/tda-api-client/tree/v1_2)

Other README files (also referenced in relevant sections below):
- [Authentication](authREADME.md)
- [Streaming](streamingREADME.md)
- [Code Samples](codesamplesREADME.md)

## Installation

```bash
npm i tda-api-client
```
## What's New
v 2.1.3
- Fixed an issue with the stream restart logic that may cause incorrect socket reuse

v 2.1.2
- Handle an error event from the TDA stream. Emit a `streamError` and `streamClosed`

v 2.1.1
- Reinstated functioning of the CLI. I had accidentally left out the cli_index.js file from the package.
- Fixed an issue when using passing in authConfig in the config to REST requests. It was still looking for a file to write to and through a file-not-found error.
- Fixed the link to the Code Samples README (a few lines above) to be correct.

v 2.1.0
- REST Queueing! Note that streaming already has a queueing ability. Now you can queue your rest calls. This is useful because api calls, other than Accounts, Orders, Saved Orders, are rate limited to 120 requests per minute. Queueing is an opt-in feature and is described more below.
- Loosened up the types on some Config objects. For example, changed some fields that wanted an enum to be enum | string.

v 2.0.1
- Fixed the names of some fields in IOption. Note that what is documented in TDA's api docs may be slightly different than the shape of the data they actually return.
- 
v 2.0.0 
- Streaming! You can now utilize the full power of TD Ameritrade's API, both the REST and the Streaming sides. Click the link to the [Streaming README](http://www.github.com/sainglend/tda-api-client/tree/master/streamingREADME.md).
- TypeScript: care has been taken to make this very IDE friendly by using TypeScript, along with plenty of interfaces and enums. Note that the intent was to create interfaces that are as close to the shape of the objects from TDA as possible. In some cases, this isn't very nice looking (see the response type from the Market Hours api, e.g.). With streaming, there may be an option to get the original shape or a transformed type. For example, when getting streaming data, fields returned are retruned in an object indexed with "1", "17", etc., which I've mapped to an object with human readable keys, like "ask" and "lastTradeTime", and you can choose to get the original or transformed data.
- Project structure: What gets published to npm is the result of compiling the typescript into `dist/` and copying over a stripped down package.json and README files. View the github page at https://www.github.com/sainglend/tda-api-client for the full experience.
- There is now sample data in the form of raw requests and responses in [the sampledata folder](http://www.github.com/sainglend/tda-api-client/tree/master/src/sampledata)
- Unit tests: There are unit tests living side-by-side with the .ts files in src/. Run these with caution!!! See notes below, but be aware that a couple actually execute trades (send and cancel).
- The module system has changed so that things can be easily and atomically imported.

v 1.1.2 - Fixed the Get Price History API call. The query param names were wrong.

v 1.1.1 - You can now use this library without a config file, instead passing in a lightweight config object with each request.

Full version review in the Version History section at the bottom.

## Known Issues
When testing the Saved Orders API, a 400 response code was received as well as a message that said: "Saved Orders are not supported for this account." Using the feature Ask Ted on the main website, Ted said: "If you have upgraded trading features, you're unable to save orders on the website. However, there are equivalent tools on thinkorswim Desktop, thinkorswim Web, and thinkorswim Mobile." In other words, if you have have Advanced Features turned on in your account, you can't use Saved Orders. This will also preclude you from placing complex orders, like 1 TRG OCO. This boggles my mind. So again, you have to turn OFF Advanced Features in your account in order to unlock some API capabilities. I haven't yet completely mapped that.

Watchlists are a little wonky. When creating a watchlist, it can be retrieved with the API, but it doesn't appear in Thinkorswim unless it is restarted.

Streaming: The documentation on TDA's website is crap, let's be honest. Book endpoints aren't documented at all. The baseline functionality is there and available for you to try. I'll keep adding documentation and examples as I can.

## Usage
You may make unauthenticated requests (which typically give delayed data) for some endpoints, but generally requests must be authenticated.

### DO THIS FIRST: You must know your authentication information
For a primer on Auth, see [authREADME.md](authREADME.md).

For making unauthenticated requests, you must know your client_id, also known as apikey, which looks like: ```FIEJ33342@AMER.OAUTHAP```

For making authenticated requests, you must additionally have a refresh_token.

Using this library, there are three ways to make requests:
### 1. Unauthenticated requests
For the methods that support it, ```apikey``` can be passed in as a config option.
Example:
```typescript
import {
  ISearchInstrumentsFundamentalsConfig,
  searchInstrumentFundamentals,
  ISearchInstrumentResults
} from "tda-api-client";

const config: ISearchInstrumentsFundamentalsConfig = {
  symbol: "MSFT",
  apikey: "EXAMPLE@AMER.OAUTHAP",
};

const result: ISearchInstrumentResults = await searchInstrumentFundamentals(config);
```
A list of methods allowing unauthenticated requests is presented below.

### 2. Authenticated requests with a config object
The difference here is that you'd pass in your client_id and refresh_token in as ```config.authConfig``` like this:
```typescript
import {
  ISearchInstrumentsFundamentalsConfig,
  searchInstrumentFundamentals,
  ISearchInstrumentResults
} from "tda-api-client";

const config: ISearchInstrumentsFundamentalsConfig = {
  symbol: "MSFT",
  authConfig: {
    refresh_token: "WOEFIJ23OIF2OIFJ2O3FIJ",
    client_id: "EXAMPLE@AMER.OAUTHAP",
  },
};

const result: ISearchInstrumentResults = await searchInstrumentFundamentals(config);
```

### 3. Authenticated requests with a config file
To use this method, you must have a config file. The default location is ```{project root}/config/tdaclientauth.json```. Please copy the example file from this library's [config/](config/) folder using the below command:

```bash
cp ./node_modules/tda-api-client/config/tdaclientauth.json ./config/tdaclientauth.json
```

OR simply copy this json into that same file location and replace the values with your own:
```json
{
    "refresh_token":"REPLACEME",
    "client_id":"EXAMPLE@AMER.OAUTHAP"
}
```

ALTERNATIVELY, you can place your auth file anywhere you like that node has r/w access to, and use that in your requests.

Example with the default file location. Note that no extra parameters are necessary:
```typescript
import {
  ISearchInstrumentsFundamentalsConfig,
  searchInstrumentFundamentals,
  ISearchInstrumentResults
} from "tda-api-client";

const config: ISearchInstrumentsFundamentalsConfig = {
  symbol: "MSFT",
};

const result: ISearchInstrumentResults = await searchInstrumentFundamentals(config);
```

Example with a custom file location, using the parameter authConfigFileLocation:
```typescript
import {
  ISearchInstrumentsFundamentalsConfig,
  searchInstrumentFundamentals,
  ISearchInstrumentResults
} from "tda-api-client";

const config: ISearchInstrumentsFundamentalsConfig = {
  symbol: "MSFT",
  authConfigFileLocation: testauthpath,
};

const result: ISearchInstrumentResults = await searchInstrumentFundamentals(config);
```

## Queueing REST calls
(For queueing of streaming requests, see the streaming README.)  
You can put your REST API calls into a queue so that you don't have to worry about rate limiting. This is a strictly opt-in feature.  
To turn on queueing you MUST set the desired spacing for request processing. When doing so, keep in mind:
- This isn't exact. The intent is that the request spacing is AT LEAST your set spacing, but it may be faster by a couple milliseconds because of how far up the chain the timer runs.
- There will be an occasional auth call, which counts against the rate limit but is NOT accounted for here. Generally, an access_token is good for many minutes, able to be set to be up to 55 (configurable with updateUserPreferences()).

Anyway, here is how to turn ON queueing:
```typescript
import {tdaRestQueue} from "tda-api-client";
// default value is 510 if you call without an input
tdaRestQueue.setRestQueueSpacing(550);
```

Now all subsequent REST calls will be queued, except for those exempt, which are found in the next section under Orders, Saved Orders, and Accounts.  
You can explicitly set a request to be queued or skip the queue (and can even though this for accounts, orders, saved order), but again, you must set the queue spacing first. You may also set callbacks to execute at four points in time. You may also optionally set something as a priority to move it to the front of the queue. A request with all of these parts looks like this:

```typescript
import {
  IRestRequestQueueConfig, EProjectionType,
  ISearchInstrumentResults, ISearchInstrumentsConfig,
  searchInstruments, tdaRestQueue
} from "tda-api-client";

tdaRestQueue.setRestQueueSpacing(550);

const queueConfig: IRestRequestQueueConfig = {
  enqueue: true,
  isPriority: false,
  cbEnqueued: () => {
    console.log("I was queued! Now I wait");
  },
  cbPre: () => {
    console.log("About to get sent over the interwebs! Bye!");
  },
  cbResult: (result: ISearchInstrumentResults) => {
    console.log(result);
  },
  cbPost: () => {
    console.log("I guess my time here is done.");
  },
};

const config: ISearchInstrumentsConfig = {
  symbol: "MSFT",
  projection: EProjectionType.SYMBOL_SEARCH,
  queueConfig,
};

const searchResults: ISearchInstrumentResults = await searchInstruments(config);
```
Notice that you can get the result a couple different ways. You can get it in the cbResult callback, or you can get it via the Promise returned from request method. Just know that the promise may take a while to resolve, so you probably shouldn't await it right at the moment you enqueue it.  
For more generic use, you could have the return type from `cbResult` be `any`.

FANTASTIC! NOW HOW DO I TURN IT OFF?  
Depending on how you want it to end, you turn it off by either optionally clearing the queue, then setting the spacing to 0.
```typescript
import {tdaRestQueue} from "tda-api-client";
tdaRestQueue.clearRestQueue();
tdaRestQueue.setRestQueueSpacing(0);
```
Clearing the queue will cause each pending promise to get resolved with NULL and none of the pre, result, or post callbacks will be called. If you set spacing to 0 without clearing, all of the queued requests will be executed, which may be undesirable behavior.
## Available REST Methods
The hierarchy is pretty flat. Under the library root, named "tda-api-client", we have (asterisks (**) indicate unauthenticated requests are possible):  
++ Indicates not rate limited, so won't be queued by default if you turn on REST request queueing.
- accounts
    - getAccount ++
    - getAccounts ++
- authentication
    - getAuthentication
    - refreshAuthentication
- instruments
    - getInstrument **
    - searchInstrument **
- markethours
    - getSingleMarketHours **
    - getMultipleMarketHours **
- movers
    - getMovers **
- optionchain
    - getOptionChain **
- orders
    - placeOrder ++
    - replaceOrder ++
    - cancelOrder ++
    - getOrder ++
    - getOrdersByAccount ++
    - getOrdersByQuery ++
- pricehistory
    - getPriceHistory **
- quotes
    - getQuote **
    - getQuotes **
- savedorders
    - createSavedOrder ++
    - deleteSavedOrder ++
    - getSavedOrderById ++
    - getSavedOrders ++
    - replaceSavedOrder ++
- transactions
    - getTransaction
    - getTransactions
- userinfo
    - getUserPreferences
    - getStreamerSubKeys
    - getUserPrincipals
    - updateUserPreferences
- watchlists
    - createWatchlist
    - deleteWatchlist
    - getWatchlist
    - getWatchlistsSingleAcct
    - getWatchlistsMultiAcct 
    - replaceWatchlist
    - updateWatchlist

Each of these functions correspond 1-to-1 with an API endpoint, and possibly some useful ENUMS.

## Documentation
### Mine
I've used a combo of Typescript with JSDoc to add comments to each enum and function that wraps an API, so that the transpiled JavaScript should be very IDE-friendly. I've also tried to add types to everything so that the shape of the output or expected input or very clear.

You can look in the [samples/](samples/) folder to see [code samples](samples/codesamples.md), which has a simple usage of each of the functions. That folder also has an inputJSON folder with a couple sample JSON inputs.

Additionally, it'd be worth checking out the unit tests for example usage, though you'll have to read around all the testing structure, with the expect statements and whatnot.

### Theirs
You can find the documentation for how the API endpoints work at https://developer.tdameritrade.com

Copies of those pages are also available locally in [apidocsarchive/](apidocsarchive/)

## Command Line Tool

You can run this as a kind of 3/4-baked standalone command line tool by cloning the project and running 
```
node ./cli_index.js
```

< > indicates a required positional argument

[ ] indicates an optional positional argument

Delve into each command to see the command options.

```bash
# This will show all top-level commands
$ node ./cli_index.js
cli_index.js <command>

Commands:
  cli_index.js accounts <command>      Get your account info for one or all linked accounts
  cli_index.js auth <command>          Perform some authentication operations
  cli_index.js instruments <command>   Search for an instrument with a text string, or get an instrument by CUSIP
  cli_index.js hours <command>         Get market hours
  cli_index.js movers <command>        Get market movers
  cli_index.js options <command>       Get option chain info
  cli_index.js orders <command>        Manage your trades
  cli_index.js pricehistory <command>  Get price history info in the form of candles data
  cli_index.js quotes <command>        Get quotes for one or more symbols
  cli_index.js savedorders <command>   Manage your saved orders
  cli_index.js trans <command>         Retrieve transaction history
  cli_index.js userinfo <command>      Get and update user information such as preferences and keys
  cli_index.js watchlist <command>     Manage your watchlists

Options:
  --version  Show version number                                                                                           [boolean]
  --help     Show help                                                                                                     [boolean]

Not enough non-option arguments: got 0, need at least 1
```
```bash
# This will show all commands nested under hours
$ node ./cli_index.js hours
cli_index.js hours <command>

Get market hours

Commands:
  cli_index.js hours get <date> <markets> [apikey]    Get market open hours for a specified date <date> (e.g. 2020-09-18) and a
                                                      comma-separated set of <markets> from EQUITY, OPTION, FUTURE, BOND, or FOREX,
                                                      e.g. "EQUITY,OPTION". Including your optional <apikey> makes an
                                                      unauthenticated request.
  cli_index.js hours getone <date> <market> [apikey]  Get market open hours for a specified date <date> and a single <market> from
                                                      EQUITY, OPTION, FUTURE, BOND, or FOREX. Including your optional <apikey> makes
                                                      an unauthenticated request.

Options:
  --version  Show version number                                                                                           [boolean]
  --help     Show help                                                                                                     [boolean]

Not enough non-option arguments: got 0, need at least 1
```
```bash
# This will show how to use the particular command
$ node ./cli_index.js hours get
cli_index.js hours get <date> <markets> [apikey]

Get market open hours for a specified date <date> (e.g. 2020-09-18) and a comma-separated set of <markets> from EQUITY, OPTION,
FUTURE, BOND, or FOREX, e.g. "EQUITY,OPTION". Including your optional <apikey> makes an unauthenticated request.

Options:
  --version  Show version number                                                                                           [boolean]
  --help     Show help                                                                                                     [boolean]

Not enough non-option arguments: got 0, need at least 2
```
For now, all responses get logged to the console, for better or for worse, so you may want to pipe the output to a file, especially for big output.
Here is an example:
```bash
node ./cli_index.js hours get 2020-12-02 FUTURES > hours.json
```
## Version History
v2.0.0 - (Jan 2022) Redid conversion to TypeScript, added streaming, unit tests, and example data.

v1.1.0 - (Feb 27, 2021) Converted to TypeScript, added in ability to make authenticated requests through the config object for each method, instead of requiring a config file.

v1.0.3 - (Feb 24, 2021) Removed logging statements and fixed auth

v1.0.2 - (Feb 23, 2021) Fixed issues in 1.0.1 as well as fixed unauthenticated requests both through regular api and cli api

v1.0.1 - (Feb 21, 2021) Attempt to fix http issues by using axios; unpublished due to bugs in auth

v1.0.0 - (Sept 18, 2020) Initial publish of library

## Roadmap (no particular order)
This was originally built for a particular set of use cases, and those will continue to be the driver for future project direction.
In no particular order:
- More documentation around streaming
- Helper methods for creating a properly formatted JSON input object (order, watchlist, etc.) given input params.

Another project is planned which will leverage this library in order to make a command line app, a shell, for trading. The goal is to be able to type "buy 10 F" instead of clicking a bunch of things in Thinkorswim or having to write a clunky Order JSON object.

## Support

Visit the github page [https://www.github.com/sainglend/tda-api-client](https://www.github.com/sainglend/tda-api-client), write a comment, or open a pull request! 
Find me on Reddit: u/sainglend
Email: sainglend@gmail.com

## License and Disclaimer

tda-api-client : a client library for the TD Ameritrade API

Copyright (C) 2020-2  Aaron Satterlee

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
[GNU General Public License](LICENSE) for more details.

I am not a licensed financial advisor, and use of this software, as well as any interactions with me or comments made by me, whether in private or public, should not constitute financial advice or trading advice.
