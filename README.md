
# TD API CLIENT
## Summary
This library is a client to use the API exposed by TD Ameritrade at https://developer.tdameritrade.com
This project can also be cloned from github to use as a command line utility.

Other README files (also referenced in relevant sections below):
- [Authentication](authREADME.md)
- [Code Samples](samples/codesamples.md)

## Known Issues
When I try to use the Saved Orders API, I get a 400 response code and a message that says "Saved Orders are not supported for this account."
Not sure what to make of that.

Watchlists are a little wonky. When I create a watchlist, I can retrieve it with the API, but I don't notice it showing up in Thinkorswim unless I restart it.

## Installation

```bash
npm i tda-api-client
```

## Usage

### DO THIS FIRST: You must have a configuration file

You must have a file at **{project root}/config/tdaclientauth.json**. Please copy the example file from this library's [config/](config/) folder using the below command:

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

For a primer on Auth, see [authREADME.md](authREADME.md).

### Now that you've got your auth file ready...

Here's a little sample code for a taste of how to use this thing.

```javascript
const tdaclient = require('tda-api-client');

tdaclient.orders.cancelOrder({orderId: 123, accountId: 456});
tdaclient.watchlists.deleteWatchlist({watchlistId: 4242, accountId: 456});
tdaclient.markethours.getSingleMarketHours({index: tdaclient.markethours.MARKETS.EQUITY, date: '2020-09-20'});
```

The hierarchy is pretty flat. Under the root object, there are:
- accounts
- authentication
- instruments
- markethours
- movers
- optionchain
- orders
- pricehistory
- quotes
- savedorders
- transactions
- userinfo
- watchlists

Each of these has their functions, which correspond 1-to-1 with an API endpoint, and possibly some useful ENUMS.

These aren't strictly organized like the API on the TD Developer site. For example, their site has Accounts, Orders, and Saved Orders grouped together.


## Documentation
### Mine
I've used JSDoc to add comments to each enum and function that wraps an API.

You can look in the [samples/](samples/) folder to see [code samples](samples/codesamples.md), which has a simple usage of each of the functions. That folder also has an inputJSON folder with sample inputs.

### Theirs
You can find the documentation for how the API endpoints work at https://developer.tdameritrade.com

A copy of those pages has also been made locally in [apidocsarchive/](apidocsarchive/)

## Command Line Tool

You can run this as a standalone command line tool by cloning the project and running ***node ./cli_index.js***:

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
## Roadmap (no particular order)
I originally built this for my own use, and my use cases will be the driver for what direction I'll take this.
In no particular order:
- Type support for Typescript
- Data structures for the input and output types, like Order, for easy parsing
- Helper methods for creating a properly formatted JSON input object (order, watchlist, etc.) given input params.
- Streaming data support for daemon apps.

I'm also planning another project which will leverage this library in order to make a command line app, a shell, for trading. I want to be able to type "buy 10 F" instead of clicking a bunch of things in Thinkorswim or having to write a clunky Order JSON object.

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
