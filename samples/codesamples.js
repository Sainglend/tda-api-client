/*
const tdaclient = require('tda-api-client');


// GET ACCOUNT 
const configGetAcct = {
    accountId: 1,
    fields: 'positions,orders'
};
const getAcctResult = await tdaclient.accounts.getAccount(configGetAcct);


// GET ACCOUNTS 
const configGetAccts = {
    fields: 'positions,orders'
};
const getAcctsResult = await tdaclient.accounts.getAccounts(configGetAccts);


// GET AUTHENTICATION 
const authConfig = await tdaclient.authentication.getAuthentication();


// REFRESH AUTHENTICATION 
const authConfig2 = await tdaclient.authentication.refreshAuthentication();


// GET INSTRUMENT 
const configGetInst = {
    cusip: 345370860,
    apikey: ''
};
const getInstrumentResult = await tdaclient.instruments.getInstrument(configGetInst);


// SEARCH INSTRUMENT 
const configSearchInst = {
    symbol: 'F',
    projection: tdaclient.instruments.PROJECTION_TYPE.SYMBOL_SEARCH,
    apikey: ''
};
const searchInstrumentResult = await tdaclient.instruments.searchInstruments(configSearchInst);


// GET SINGLE MARKET HOURS 
const configGetMktHours = {
    market: tdaclient.markethours.MARKETS.OPTION,
    date: '2020-09-10',
    apikey: ''
};
const getSingleMarketHoursResult = await tdaclient.markethours.getSingleMarketHours(configGetMktHours);


// GET MULTI MARKET HOURS 
const configGetMultiMktHours = {
    markets: 'EQUITY,OPTION,FUTURE,BOND,FOREX',
    date: '2020-09-10',
    apikey: ''
};
const getMultiMarketHoursResult = await tdaclient.markethours.getMultipleMarketHours(configGetMultiMktHours);


// GET MARKET MOVERS 
const moversConfig = {
    index: tdaclient.movers.INDEX.SPX,
    direction: tdaclient.movers.DIRECTION.UP,
    change: tdaclient.movers.CHANGE.PERCENT,
    apikey: ''
};
const getMoversResult = await tdaclient.movers.getMovers(moversConfig);


// GET OPTIONS CHAIN 
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


// GET PRICE HISTORY 
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


// GET QUOTE 
const getQuoteConfig = {
    symbol: 'F',
    apikey: ''
};
const getQuoteResult = await tdaclient.quotes.getQuote(getQuoteConfig);


// GET QUOTES 
const getQuotesConfig = {
    symbol: 'F,T,O',
    apikey: ''
};
const getQuotesResult = await tdaclient.quotes.getQuotes(getQuotesConfig);


// CREATE SAVED ORDER 
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


// DELETE SAVED ORDER 
const deleteSavedOrderConfig = {
    accountId: 1,
    savedOrderId: 123
};
const deleteSavedOrderResult = await tdaclient.savedorders.deleteSavedOrder(deleteSavedOrderConfig);


// GET SAVED ORDER BY ID 
const getSavedOrderConfig = {
    accountId: 1,
    savedOrderId: 123
};
const getSavedOrderResult = await tdaclient.savedorders.getSavedOrderById(getSavedOrderConfig);


// GET SAVED ORDER BY PATH 
const getSavedOrdersConfig = {
    accountId: 1
};
const getSavedOrdersResult = await tdaclient.savedorders.getSavedOrders(getSavedOrdersConfig);


// REPLACE SAVED ORDER 
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


// CANCEL ORDER 
const cancelOrderConfig = {
    accountId: 1,
    orderId: 321
};
const cancelOrderResult = await tdaclient.orders.cancelOrder(cancelOrderConfig);


// GET ORDER 
const getOrderConfig = {
    accountId: 1,
    orderId: 321
};
const getOrderResult = await tdaclient.orders.getOrder(getOrderConfig);


// GET ORDERS BY ACCOUNT 
const getOrdersConfig = {
    accountId: 1,
    maxResults: 10,
    fromEnteredTime: '', //yyyy-MM-dd
    toEnteredTime: '', //yyyy-MM-dd
    status: tdaclient.orders.ORDER_STATUS.QUEUED
};
const getOrdersResult = await tdaclient.orders.getOrdersByAccount(getOrdersConfig);


// GET ORDERS BY QUERY 
const getOrdersQueryConfig = {
    accountId: '', //1, blank is fine
    maxResults: 10,
    fromEnteredTime: '', //yyyy-MM-dd
    toEnteredTime: '', //yyyy-MM-dd
    status: tdaclient.orders.ORDER_STATUS.QUEUED
};
const getOrdersQueryResult = await tdaclient.orders.getOrdersByQuery(getOrdersQueryConfig);


// REPLACE ORDER 
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


// PLACE ORDER 
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


// GET TRANSACTION 
const getTransactionConfig = {
    accountId: 1,
    transactionId: 321
};
const getTransactionResult = await tdaclient.transactions.getTransaction(getTransactionConfig);


// GET TRANSACTIONS 
const getTransactionsConfig = {
    accountId: 1,
    symbol: '',
    startDate: '2020-08-25',
    endDate: '2020-09-01',
    type: tdaclient.transactions.TRANSACTION_TYPE.ALL
};
const getTransactionsResult = await tdaclient.transactions.getTransactions(getTransactionsConfig);


// GET USER PREFERENCES 
const getUserPrefConfig = {
    accountId: 1
};
const getUserPrefResult = await tdaclient.userinfo.getUserPreferences(getUserPrefConfig);


// GET STREAMER SUBSCRIPTION KEYS 
const getStreamerKeysConfig = {
    accountIds: '1,2'
};
const getStreamerKeysResult = await tdaclient.userinfo.getStreamerSubKeys(getStreamerKeysConfig);


// UPDATE USER PREFERENCES 
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


// GET USER PRINCIPAL DATA 
const getUserPrinConfig = {
    fields: 'streamerSubscriptionKeys,streamerConnectionInfo,preferences,surrogateIds'
};
const getUserPrinResult = await tdaclient.userinfo.getUserPrincipals(getUserPrinConfig);


// UPDATE WATCHLIST 
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


// REPLACE WATCHLIST 
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


// GET WATCHLISTS SINGLE ACCOUNT 
const getWatchlistsSingleAcctConfig = {
    accountId: 1
};
const getWatchlistsSingleAcctResult = await tdaclient.watchlists.getWatchlistsSingleAcct(getWatchlistsSingleAcctConfig);


// GET WATCHLISTS ALL LINKED ACCOUNTS 
const getWatchlistsAllAcctsResult = await tdaclient.watchlists.getWatchlistsMultiAcct({});


// GET SINGLE WATCHLIST 
const getSingleWatchlistConfig = {
    accountId: 1,
    watchlistId: 321
};
const getSingleWatchlistResult = await tdaclient.watchlists.getWatchlist(getSingleWatchlistConfig);


// DELETE WATCHLIST 
const deleteWatchlistConfig = {
    accountId: 1,
    watchlistId: 433
};
const deleteWatchlistResult = await tdaclient.watchlists.deleteWatchlist(deleteWatchlistConfig);


// CREATE WATCHLIST 
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
*/
