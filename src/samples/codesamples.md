# CODE SAMPLES
[Link back to main README](../README.md)
## INTRODUCTION
### Require Statement
Put this at the top of any .js file that will use the client functions.
```javascript
const tdaclient = require('tda-api-client');
```

### Authentication

Using this requires either an auth config file or passing in an auth config object. All the examples below were written when the config file was required. To pass in auth config to each function, then here is an example using Accounts -> Get Account
#### Get Account With Auth Config File (automatically picked up)
```javascript
const configGetAcct = {
    accountId: 1,
    fields: 'positions,orders'
};
const getAcctResult = await tdaclient.accounts.getAccount(configGetAcct);
```

#### Get Account With Auth in Config Object
```javascript
const configGetAcct = {
    accountId: 1,
    fields: 'positions,orders',
    authConfig: {
        "refresh_token": "SrgS0QJK",
        "client_id": "FIEJ33342@AMER.OAUTHAP",
    }
};
const getAcctResult = await tdaclient.accounts.getAccount(configGetAcct);
```

In the case that an auth config file is defined and you pass in an auth config object, the passed in config will take precedence.

## CATEGORIES
Note: This is a file of code samples. For documentation, refer to the official website [https://developer.tdameritrade.com](https://developer.tdameritrade.com) or look in the apidocsarchive/ folder.
- [ACCOUNTS](#accounts)
- [AUTHENTICATION](#authentication)
- [INSTRUMENTS](#instruments)
- [MARKET HOURS](#market-hours)
- [MOVERS](#movers)
- [OPTIONS CHAIN](#options-chain)
- [ORDERS](#orders)
- [PRICE HISTORY](#price-history)
- [QUOTES](#quotes)
- [SAVED ORDERS](#saved-orders)
- [TRANSACTIONS](#transactions)
- [USER INFO](#user-info)
- [WATCHLISTS](#watchlists)


## ACCOUNTS
### Get Account
```javascript
const configGetAcct = {
    accountId: 1,
    fields: 'positions,orders'
};
const getAcctResult = await tdaclient.accounts.getAccount(configGetAcct);
```

### Get Accounts
```javascript
const configGetAccts = {
    fields: 'positions,orders'
};
const getAcctsResult = await tdaclient.accounts.getAccounts(configGetAccts);
```

## AUTHENTICATION
### Get Authentication
```javascript
const authConfig = await tdaclient.authentication.getAuthentication();
```

### Refresh Authentication
```javascript
const authConfig = await tdaclient.authentication.refreshAuthentication();
```

## INSTRUMENTS
### Get Instrument 
```javascript
const configGetInst = {
    cusip: 345370860,
    apikey: ''
};
const getInstrumentResult = await tdaclient.instruments.getInstrument(configGetInst);
```

### Search Instrument 
```javascript
const configGetAcct = {
    symbol: 'F',
    projection: tdaclient.instruments.PROJECTION_TYPE.SYMBOL_SEARCH,
    apikey: ''
};
const searchInstrumentResult = await tdaclient.instruments.searchInstruments(configSearchInst);
```

## MARKET HOURS
### Get Single Market Hours 
```javascript
const configGetMktHours = {
    market: tdaclient.markethours.MARKETS.OPTION,
    date: '2020-09-10',
    apikey: ''
};
const getSingleMarketHoursResult = await tdaclient.markethours.getSingleMarketHours(configGetMktHours);
```

### Get Multi Market Hours 
```javascript
const configGetMultiMktHours = {
    markets: 'EQUITY,OPTION,FUTURE,BOND,FOREX',
    date: '2020-09-10',
    apikey: ''
};
const getMultiMarketHoursResult = await tdaclient.markethours.getMultipleMarketHours(configGetMultiMktHours);
```

## MOVERS
### Get Market Movers 
```javascript
const moversConfig = {
    index: tdaclient.movers.INDEX.SPX,
    direction: tdaclient.movers.DIRECTION.UP,
    change: tdaclient.movers.CHANGE.PERCENT,
    apikey: ''
};
const getMoversResult = await tdaclient.movers.getMovers(moversConfig);
```

## OPTIONS CHAIN
### Get Options Chain 
```javascript
const optionsConfig = {
    symbol: 'SPY',
    contractType: tdaclient.optionchain.CONTRACT_TYPE.ALL,
    strikeCount: 60,
    includeQuotes: 'TRUE',
    strategy: tdaclient.optionchain.STRATEGY.SINGLE,
    range: tdaclient.optionchain.RANGE.ALL,
    fromDate: '2020-09-01',
    toDate: '2020-09-10',
    expMonth: tdaclient.optionchain.EXPIRATION_MONTH.SEP,
    optionType: tdaclient.optionchain.OPTION_TYPE.STANDARD
};
const getOptionChainResult = await tdaclient.optionchain.getOptionChain(optionsConfig);
```

## ORDERS
### Cancel Order
```javascript
const cancelOrderConfig = {
    accountId: 1,
    orderId: 321
};
const cancelOrderResult = await tdaclient.orders.cancelOrder(cancelOrderConfig);
```

### Get Order 
```javascript
const getOrderConfig = {
    accountId: 1,
    orderId: 321
};
const getOrderResult = await tdaclient.orders.getOrder(getOrderConfig);
```

### Get Orders By Account 
```javascript
const getOrdersConfig = {
    accountId: 1,
    maxResults: 10,
    fromEnteredTime: '', //yyyy-MM-dd
    toEnteredTime: '', //yyyy-MM-dd
    status: tdaclient.orders.ORDER_STATUS.QUEUED
};
const getOrdersResult = await tdaclient.orders.getOrdersByAccount(getOrdersConfig);
```

### Get Orders By Query
```javascript
const getOrdersQueryConfig = {
    accountId: '', //1, blank is fine
    maxResults: 10,
    fromEnteredTime: '', //yyyy-MM-dd
    toEnteredTime: '', //yyyy-MM-dd
    status: tdaclient.orders.ORDER_STATUS.QUEUED
};
const getOrdersQueryResult = await tdaclient.orders.getOrdersByQuery(getOrdersQueryConfig);
```

### Replace Order
```javascript
const replaceOrderConfig = {
    orderJSON: {
        "orderType": "MARKET",
        "session": "NORMAL",
        "duration": "DAY",
        "orderStrategyType": "SINGLE",
        "orderLegCollection": [
            {
                "instruction": "Buy",
                "quantity": 11,
                "instrument": {
                    "symbol": "F",
                    "assetType": "EQUITY"
                }
            }
        ]
    },
    accountId: 1,
    orderId: 321
};
const replaceOrderResult = await tdaclient.orders.replaceOrder(replaceOrderConfig);
```

### Place Order
```javascript
const placeOrderConfig = {
    orderJSON: {
        "orderType": "MARKET",
        "session": "NORMAL",
        "duration": "DAY",
        "orderStrategyType": "SINGLE",
        "orderLegCollection": [
            {
                "instruction": "Buy",
                "quantity": 9,
                "instrument": {
                    "symbol": "F",
                    "assetType": "EQUITY"
                }
            }
        ]
    },
    accountId: 1
};
const placeOrderResult = await tdaclient.orders.placeOrder(placeOrderConfig);
```

## PRICE HISTORY
### Get Price History 
```javascript
const priceHistoryConfig = {
    startDate: new Date('2019-09-01 07:00:00').getTime(),
    endDate: new Date('2020-09-01 16:00:00').getTime(),
    periodType: tdaclient.pricehistory.PERIOD_TYPE.YEAR,
    frequencyType: tdaclient.pricehistory.FREQUENCY_TYPE.YEAR.WEEKLY,
    frequency: tdaclient.pricehistory.FREQUENCY.WEEKLY.ONE,
    symbol: 'F',
    getExtendedHours: 'true'
};
const getPriceHistoryResult = await tdaclient.pricehistory.getPriceHistory(priceHistoryConfig);
```

## QUOTES
### Get Quote 
```javascript
const getQuoteConfig = {
    symbol: 'F',
    apikey: ''
};
const getQuoteResult = await tdaclient.quotes.getQuote(getQuoteConfig);
```

### Get Quotes 
```javascript
const getQuotesConfig = {
    symbol: 'F,T,O',
    apikey: ''
};
const getQuotesResult = await tdaclient.quotes.getQuotes(getQuotesConfig);
```

## SAVED ORDERS
### Create Saved Order 
```javascript
const createSavedOrderConfig = {
    orderJSON: {
        "orderType": "MARKET",
        "session": "NORMAL",
        "duration": "DAY",
        "orderStrategyType": "SINGLE",
        "orderLegCollection": [
          {
            "orderLegType": "EQUITY",
            "legId": 0,
            "instruction": "BUY",
            "quantity": 10,
            "quantityType": "SHARES",
            "instrument": {
              "symbol": "F",
              "assetType": "EQUITY"
            }
          }
        ]
      },
    accountId: 1
};
const createSavedOrderResult = await tdaclient.savedorders.createSavedOrder(createSavedOrderConfig);
```

### Delete Saved Order 
```javascript
const deleteSavedOrderConfig = {
    accountId: 1,
    savedOrderId: 123
};
const deleteSavedOrderResult = await tdaclient.savedorders.deleteSavedOrder(deleteSavedOrderConfig);
```

### Get Saved Order By Id
```javascript
const getSavedOrderConfig = {
    accountId: 1,
    savedOrderId: 123
};
const getSavedOrderResult = await tdaclient.savedorders.getSavedOrderById(getSavedOrderConfig);
```

### Get Saved Order By Path 
```javascript
const getSavedOrdersConfig = {
    accountId: 1
};
const getSavedOrdersResult = await tdaclient.savedorders.getSavedOrders(getSavedOrdersConfig);
```

### Replace Saved Order 
```javascript
const replaceSavedOrderConfig = {
    orderJSON: {
        "orderType": "MARKET",
        "session": "NORMAL",
        "duration": "DAY",
        "orderStrategyType": "SINGLE",
        "orderLegCollection": [
            {
                "orderLegType": "EQUITY",
                "legId": 0,
                "instruction": "BUY",
                "quantity": 15,
                "quantityType": "SHARES",
                "instrument": {
                    "symbol": "F",
                    "assetType": "EQUITY"
                }
            }
        ]
    },
    accountId: 1,
    savedOrderId: 123
};
const replaceSavedOrderResult = await tdaclient.savedorders.replaceSavedOrder(replaceSavedOrderConfig);
```

## TRANSACTIONS
### Get Transaction
```javascript
const getTransactionConfig = {
    accountId: 1,
    transactionId: 321
};
const getTransactionResult = await tdaclient.transactions.getTransaction(getTransactionConfig);
```

### Get Transactions 
```javascript
const getTransactionsConfig = {
    accountId: 1,
    symbol: '',
    startDate: '2020-08-25',
    endDate: '2020-09-01',
    type: tdaclient.transactions.TRANSACTION_TYPE.ALL
};
const getTransactionsResult = await tdaclient.transactions.getTransactions(getTransactionsConfig);
```

## USER INFO
### Get User Preferences
```javascript
const getUserPrefConfig = {
    accountId: 1
};
const getUserPrefResult = await tdaclient.userinfo.getUserPreferences(getUserPrefConfig);
```

### Get Streamer Subscription Keys
```javascript
const getStreamerKeysConfig = {
    accountIds: '1,2'
};
const getStreamerKeysResult = await tdaclient.userinfo.getStreamerSubKeys(getStreamerKeysConfig);
```

### Update User Preferences
```javascript
const updateUserPrefsConfig = {
    accountId: 1,
    preferencesJSON: {
        "expressTrading":false,
        "defaultEquityOrderLegInstruction":"NONE",
        "defaultEquityOrderType":"LIMIT",
        "defaultEquityOrderPriceLinkType":"NONE",
        "defaultEquityOrderDuration":"DAY",
        "defaultEquityOrderMarketSession":"NORMAL",
        "defaultEquityQuantity":0,
        "mutualFundTaxLotMethod":"FIFO",
        "optionTaxLotMethod":"FIFO",
        "equityTaxLotMethod":"FIFO",
        "defaultAdvancedToolLaunch":"NONE",
        "authTokenTimeout":"FIFTY_FIVE_MINUTES"
    }
};
const updateUserPrefResult = await tdaclient.userinfo.updateUserPreferences(updateUserPrefsConfig);
```

### Get User Principal Data
```javascript
const getUserPrinConfig = {
    fields: 'streamerSubscriptionKeys,streamerConnectionInfo,preferences,surrogateIds'
};
const getUserPrinResult = await tdaclient.userinfo.getUserPrincipals(getUserPrinConfig);
```

## WATCHLISTS
### Update Watchlist
```javascript
const updateWatchlistConfig = {
    accountId: 1,
    watchlistId: 147,
    watchlistJSON: {
        "name": "testwatchlist3update",
        "watchlistItems": [
            {
                "quantity": 1,
                "averagePrice": 2,
                "commission": 3,
                "purchasedDate": "2020-08-21",
                "instrument": {
                    "symbol": "AMZN",
                    "assetType": 'EQUITY'
                }
            }
        ]
    }
};
const updateWatchlistResult = await tdaclient.watchlists.updateWatchlist(updateWatchlistConfig);
```

### Replace Watchlist
```javascript
const replaceWatchlistConfig = {
    accountId: 1,
    watchlistId: 321,
    watchlistJSON: {
        "name": "testwatchlist2",
        "watchlistItems": [
            {
                "quantity": 1,
                "averagePrice": 2,
                "commission": 3,
                "purchasedDate": "2020-08-21",
                "instrument": {
                    "symbol": "FB",
                    "assetType": 'EQUITY'
                }
            }
        ]
    }
};
const replaceWatchlistResult = await tdaclient.watchlists.replaceWatchlist(replaceWatchlistConfig);
```

### Get Watchlists Single Account
```javascript
const getWatchlistsSingleAcctConfig = {
    accountId: 1
};
const getWatchlistsSingleAcctResult = await tdaclient.watchlists.getWatchlistsSingleAcct(getWatchlistsSingleAcctConfig);
```

### Get Watchlists All Linked Accounts
```javascript
const getWatchlistsAllAcctsResult = await tdaclient.watchlists.getWatchlistsMultiAcct({});
```

### Get Single Watchlist
```javascript
const getSingleWatchlistConfig = {
    accountId: 1,
    watchlistId: 321
};
const getSingleWatchlistResult = await tdaclient.watchlists.getWatchlist(getSingleWatchlistConfig);
```

### Delete Watchlist
```javascript
const deleteWatchlistConfig = {
    accountId: 1,
    watchlistId: 433
};
const deleteWatchlistResult = await tdaclient.watchlists.deleteWatchlist(deleteWatchlistConfig);
```

### Create Watchlist
```javascript
const createWatchlistConfig = {
    accountId: 1,
    watchlistJSON: {
        "name": "test_watchlist",
        "watchlistItems": [
            {
                "quantity": 1,
                "averagePrice": 2,
                "commission": 3,
                "purchasedDate": "2020-08-21",
                "instrument": {
                    "symbol": "T",
                    "assetType": 'EQUITY'
                }
            }
        ]
    }
};
const createWatchlistResult = await tdaclient.watchlists.createWatchlist(createWatchlistConfig);
```
