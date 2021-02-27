
# TDA API CLIENT
v1.1.0
## Summary
This library is a client to use the API exposed by TD Ameritrade at https://developer.tdameritrade.com
This project can also be cloned from github to use as a command line utility.

Other README files (also referenced in relevant sections below):
- [Authentication](authREADME.md)
- [Code Samples](samples/codesamples.md)

## Known Issues
When testing the Saved Orders API, a 400 response code was received as well as a message that said: "Saved Orders are not supported for this account." Using the feature Ask Ted on the main website, Ted said: "If you have upgraded trading features, you're unable to save orders on the website. However, there are equivalent tools on thinkorswim Desktop, thinkorswim Web, and thinkorswim Mobile." It isn't clear if this is related to the Saved Orders API. Saved orders worked fine when tested on the other platforms.

UPDATE in v1.0.2: I now understand the above to be because I have Advanced Features turned on in my account. This will also preclude you from placing complex orders, like 1 TRG OCO. This boggles my mind. So again, you have to turn OFF Advanced Features in your account in order to unlock some API capabilities. I haven't yet completely mapped that.

Watchlists are a little wonky. When creating a watchlist, it can be retrieved with the API, but it doesn't appear in Thinkorswim unless it is restarted.

## Installation

```bash
npm i tda-api-client
```

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
```js
const tdaclient = require('tda-api-client');

const configGetMarketHrs = {
        market: 'OPTION',
        date: '2021-03-02',
        apikey: 'FIEJ33342@AMER.OAUTHAP'
};

const hrs = await tdaclient.markethours.getSingleMarketHours(configGetMarketHrs);

```
A list of methods allowing unauthenticated requests are listed below.

### 2. Authenticated requests with a config object
The difference here is that you'd pass in your client_id and refresh_token in as ```config.authConfig``` like this:
```js
const tdaclient = require('tda-api-client');

const configGetMarketHrs = {
        market: 'OPTION',
        date: '2021-03-02',
        authConfig: {
            "refresh_token": "SrgS0QJK",
            "client_id": "FIEJ33342@AMER.OAUTHAP",
        }
};

const hrs = await tdaclient.markethours.getSingleMarketHours(configGetMarketHrs);

```

### 3. Authenticated requests with a config file
To use this method, you must have a file at ```{project root}/config/tdaclientauth.json```. Please copy the example file from this library's [config/](config/) folder using the below command:

```bash
cp ./node_modules/tda-api-client/config/tdaclientauth.json ./config/tdaclientauth.json
```

OR copy this json and replace the values with your own:
```json
{
    "refresh_token":"REPLACEME",
    "client_id":"EXAMPLE@AMER.OAUTHAP"
}
```

### Now that you've got your auth file ready...

Here's a little sample code for a taste of how to use this thing. This is using auth from a file.

```javascript
const tdaclient = require('tda-api-client');

await tdaclient.orders.cancelOrder({orderId: 123, accountId: 456});
await tdaclient.watchlists.deleteWatchlist({watchlistId: 4242, accountId: 456});
const hours = await tdaclient.markethours.getSingleMarketHours({index: tdaclient.markethours.MARKETS.EQUITY, date: '2020-09-20'});
```

The hierarchy is pretty flat. Under the root object, named "tdaclient" in the above example, we have (asterisks indicate unauthenticated requests are possible):
- accounts
    - getAccount
    - getAccounts
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
    - placeOrder
    - replaceOrder
    - cancelOrder
    - getOrder
    - getOrdersByAccount
    - getOrdersByQuery
- pricehistory
    - getPriceHistory **
- quotes
    - getQuote **
    - getQuotes **
- savedorders
    - createSavedOrder
    - deleteSavedOrder
    - getSavedOrderById
    - getSavedOrders
    - replaceSavedOrder
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

Each of the 13 first-level objects has their functions, as listed, which correspond 1-to-1 with an API endpoint, and possibly some useful ENUMS.

These aren't strictly organized like the API on the TD Developer site. For example, their site has Accounts, Orders, and Saved Orders grouped together.


## Documentation
### Mine
I've used JSDoc to add comments to each enum and function that wraps an API. I also converted this to TypeScript and will be adding in better and better type support.

You can look in the [samples/](samples/) folder to see [code samples](samples/codesamples.md), which has a simple usage of each of the functions. That folder also has an inputJSON folder with sample inputs.

### Theirs
You can find the documentation for how the API endpoints work at https://developer.tdameritrade.com

Copies of those pages are also available locally in [apidocsarchive/](apidocsarchive/)

## Command Line Tool

You can run this as a standalone command line tool by cloning the project and running 
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
v1.1.0 - (Feb 27, 2021) Converted to TypeScript, added in ability to make authenticated requests through the config object for each method, instead of requiring a config file.

v1.0.3 - (Feb 24, 2021) Removed logging statements and fixed auth

v1.0.2 - (Feb 23, 2021) Fixed issues in 1.0.1 as well as fixed unauthenticated requests both through regular api and cli api

v1.0.1 - (Feb 21, 2021) Attempt to fix http issues by using axios; unpublished due to bugs in auth

v1.0.0 - (Sept 18, 2020) Initial publish of library

## Roadmap (no particular order)
This was originally built for a particular set of use cases, and those will continue to be the driver for future project direction.
In no particular order:
- Improved type support for Typescript
- Data structures for the input and output types, like Order, for easy parsing
- Helper methods for creating a properly formatted JSON input object (order, watchlist, etc.) given input params.
- Streaming data support for daemon apps.

Another project is planned which will leverage this library in order to make a command line app, a shell, for trading. The goal is to be able to type "buy 10 F" instead of clicking a bunch of things in Thinkorswim or having to write a clunky Order JSON object.

## Support

Visit the github page [https://www.github.com/Sainglend/tda-api-client](https://www.github.com/Sainglend/tda-api-client), write a comment, or open a pull request! 
Find me on Reddit: u/sainglend
Email: sainglend@gmail.com

## License and Disclaimer

tda-api-client : a client library for the TD Ameritrade API

Copyright (C) 2020  Aaron Satterlee

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
[GNU General Public License](LICENSE) for more details.

I am not a licensed financial advisor, and use of this software, as well as any interactions with me or comments made by me, whether in private or public, should not constitute financial advice or trading advice.
