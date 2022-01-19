# CODE SAMPLES
[Link back to main README](README.md)
## INTRODUCTION
See the [streaming README](streamingREADME.md) for examples specific to streaming. There is yet more to come on that front.

Also, checkout the unit tests that are in the `*.test.ts` files in the github repo, which themselves give some usage examples, albeit contrived. 
### Import Statement
Put this at the top of any .js/.ts file that will use the client functions, and import what you need.
```typescript
import { getAccount } from "tda-api-client";
```
For brevity, I won't add an import statement at the top of each example after the initial auth examples.

#### Note on Authentication

Using these methods requires some level of authorization or authentication. Some may simply allow you to use your client_id (EXAMPLE@AMER.OAUTHAP), but mostly you'll want to make authenticated requests, either with an auth config file or passing in an auth config object. See the [auth README](authREADME.md) for details.

All the examples below were written assuming that there is a config file in the default location `{project_root}/config/tdaclientauth.json`. However, here are examples with (1) auth config passed directly to one of the REST API calls, (2) auth config stored as a file in a custom location, and (3) an unauthenticated request using apikey (also known as client_id), here using Instruments -> Get Instrument
#### Get Instrument With Auth in Config Object
```typescript
import {ISearchInstrumentResult, IGetInstrumentConfig, getInstrument} from "tda-api-client";

const config: IGetInstrumentConfig = {
    cusip: "594918104",
    authConfig: {
        "refresh_token": "SrgS0QJK",
        "client_id": "FIEJ33342@AMER.OAUTHAP",
    }
};
const result: ISearchInstrumentResult[] = await getInstrument(config);
```

#### Get Instrument With Auth in Config File in Custom Location
```typescript
import {ISearchInstrumentResult, IGetInstrumentConfig, getInstrument} from "tda-api-client";

const config: IGetInstrumentConfig = {
    cusip: "594918104",
    authConfigFileLocation: authpath,
};
const result: ISearchInstrumentResult[] = await getInstrument(config);
```

#### Get Instrument With Auth Config File in Default Location (automatically picked up)
```typescript
import {ISearchInstrumentResult, IGetInstrumentConfig, getInstrument} from "tda-api-client";

const config: IGetInstrumentConfig = {
    cusip: "594918104",
};
const result: ISearchInstrumentResult[] = await getInstrument(config);
```

#### Get Instrument With an Unauthenticated Request, Using apikey (client_id)
```typescript
import {ISearchInstrumentResult, IGetInstrumentConfig, getInstrument} from "tda-api-client";

const config: IGetInstrumentConfig = {
    cusip: "594918104",
    apikey: "EXAMPLE@AMER.OAUTHAP"
};
const result: ISearchInstrumentResult[] = await getInstrument(config);
```

In the case that an auth config file is defined in the default location, and you pass in the custom config filepath, and you pass in an auth config object, the order of precedence is:
1. auth config object
2. config file in custom location
3. config file in default location

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

```typescript
import {getAccount, IAccount, IGetAccountConfig} from "tda-api-client";

const config: IGetAccountConfig = {
    accountId: 1,
    fields: "positions,orders",
    authConfigFileLocation: testauthpath,
};
const account: IAccount = await getAccount(config);
;
```

### Get Accounts
Note that this uses an array based on the enum. The example above used a comma-separated string. Either is fine.

```typescript
import {EGetAccountField, getAccounts, IAccount, IGetAccountsConfig} from "tda-api-client";

const config: IGetAccountsConfig = {
    fields: [EGetAccountField.ORDERS, EGetAccountField.POSITIONS],
};
const result: IAccount[] = await getAccounts(config);
```

## AUTHENTICATION
### Get Authentication

```typescript
import {getAPIAuthentication, IAuthConfig} from "tda-api-client";

const authConfig: IAuthConfig = await getAPIAuthentication();
```

### Refresh Authentication

```typescript
import {IAuthConfig, refreshAPIAuthentication} from "tda-api-client";

const authConfig: IAuthConfig = await refreshAPIAuthentication();
```

### Refresh Authorization
Use this when needed, every few months, or get a new refresh_token by hand.
```typescript
import {IAuthConfig, refreshAPIAuthorization} from "tda-api-client";

const authConfig: IAuthConfig = await refreshAPIAuthorization();
```

## INSTRUMENTS
All Instruments methods can be called as unauthenticated requests, using just your apikey.

### Search Instrument

```typescript
import {EProjectionType, ISearchInstrumentResults,
    ISearchInstrumentsConfig, searchInstruments} from "tda-api-client";

const config: ISearchInstrumentsConfig = {
    symbol: "MSFT",
    projection: EProjectionType.SYMBOL_SEARCH,
};
const result: ISearchInstrumentResults = await searchInstruments(config);
```

### Search Instrument Fundamentals
This is just a convenience wrapper around `searchInstrument()` for the specific case of searching fundamentals.

```typescript
import {ISearchInstrumentResults, ISearchInstrumentsFundamentalsConfig,
    searchInstrumentFundamentals} from "tda-api-client";

const config: ISearchInstrumentsFundamentalsConfig = {
    symbol: "MSFT",
};
const result: ISearchInstrumentResults = await searchInstrumentFundamentals(config);
```

### Get Instrument
Fun fact: 594918104 is the CUSIP for MSFT (Microsoft)

```typescript
import {ISearchInstrumentResult, IGetInstrumentConfig,
    getInstrument} from "tda-api-client";

const config: IGetInstrumentConfig = {
    cusip: "594918104",
};
const result: ISearchInstrumentResult[] = await getInstrument(config);
```

## MARKET HOURS
These requests may be unauthenticated, using just your apikey.

I apologize for the shape of the returned data. I attempted to preserve the original structure from TDA, probably a mistake, ha.
### Get Single Market Hours
The `market` param can be a string or use the enum.

```typescript
import {
    getSingleMarketHours, IGetSingleMarketHoursConfig,
    IMarketMarketHours, EMarkets
} from "tda-api-client";

const config: IGetSingleMarketHoursConfig = {
    market: EMarkets.EQUITY,
    date: "2022-11-21",
};
const result: IMarketMarketHours = await getSingleMarketHours(config);
```

### Get Multi Market Hours
The `markets` param may be a comma-separated string ("EQUITY,FOREX"), a string array (["EQUITY", "FOREX"]), or an array built from the enum, as shown below.

```typescript
import {EMarkets, getMultipleMarketHours, IGetMultiMarketHoursConfig,
    IMarketMarketHours} from "tda-api-client";

const config: IGetMultiMarketHoursConfig = {
    markets: [EMarkets.EQUITY, EMarkets.BOND, EMarkets.FOREX,
        EMarkets.OPTION, EMarkets.FUTURE],
    date: "2022-11-21",
};
const result: IMarketMarketHours = await getMultipleMarketHours(config);
```

## MOVERS
This request may be unauthenticated, using just your apikey.
### Get Market Movers

```typescript
import {EChange, EDirection, EIndex, getMovers,
    IGetMoversConfig, IMover} from "tda-api-client";

const config: IGetMoversConfig = {
    index: EIndex.SPX,
    direction: EDirection.UP,
    change: EChange.PERCENT,
};
const result: IMover[] = await getMovers(config);
```

## OPTIONS CHAIN
This request may be unauthenticated, using just your apikey. Note that the only required field is `symbol`. All others have sensible defaults.

This returned data structure is also ... interesting to work with.
### Get Options Chain

```typescript
import {
    EContractType, EExpirationMonth, ERange, EStrategy,
    IGetOptionChainConfig, getOptionChain, IOptionChain
} from "tda-api-client";

const config: IGetOptionChainConfig = {
    symbol: "MSFT",
    expMonth: EExpirationMonth.JAN,
    contractType: EContractType.CALL,
    strategy: EStrategy.SINGLE,
    range: ERange.OTM,
    includeQuotes: true,
    strikeCount: 10,
    fromDate: "2022-01-01",
};
const result: IOptionChain = await getOptionChain(config);
```

## ORDERS
Note that some advanced order types are only available if you DON'T have advanced features turned on in your TD Ameritrade account (I don't know what sense that makes).

There are a couple convenience methods provided to quickly construct a LIMIT BUY and MARKET BUY order, meant mainly for examples.
### Cancel Order

```typescript
import {cancelOrder, IGenericOrderConfig} from "tda-api-client";

const cancelOrderConfig: IGenericOrderConfig = {
    accountId: 1,
    orderId: 321
};
await cancelOrder(cancelOrderConfig);
```

### Get Order
```typescript
import {getOrder, IGenericOrderConfig, IOrderGet} from "tda-api-client";

const getOrderConfig: IGenericOrderConfig = {
    accountId: 1,
    orderId: 321
};
const getOrderResult: IOrderGet = await getOrder(getOrderConfig);
```

### Get Orders By Account

```typescript
import {EOrderStatus, getOrdersByAccount, IOrderGet,
    IOrdersByAccountConfig} from "tda-api-client";

const config: IOrdersByAccountConfig = {
    accountId: 1,
    maxResults: 5,
    fromEnteredTime: "2022-01-01",
    toEnteredTime: "2022-01-20",
    status: EOrderStatus.CANCELED,
};
const result: IOrderGet[] = await getOrdersByAccount(config);
```

### Get Orders By Query

```typescript
import {EOrderStatus, getOrdersByQuery, IOrderGet,
    IOrdersByQueryConfig} from "tda-api-client";

const config: IOrdersByQueryConfig = {
    accountId: 1,
    maxResults: 5,
    fromEnteredTime: "2022-01-01",
    toEnteredTime: "2022-01-20",
    status: EOrderStatus.CANCELED,
};
const result: IOrderGet[] = await getOrdersByQuery(config);
```

### Replace Order
Use the `.location` property of IWriteResponse and parse the new order number.
```typescript
import {generateBuyLimitEquityOrder, IReplaceOrderConfig, replaceOrder,
    IWriteResponse} from "tda-api-client";

const configReplace: IReplaceOrderConfig = {
    orderId: 123,
    accountId: 1,
    orderJSON: generateBuyLimitEquityOrder({symbol: "F", price: 3.50, quantity: 1}),
};
const resultReplace: IWriteResponse = await replaceOrder(configReplace);
```

### Place Order
You can use the enums or plain strings in the orderJSON. Enums are there for your convenience.

Use the `.location` property of IWriteResponse and parse the new order number.
```typescript
import {
    EOrderDuration, EOrderInstruction, EOrderSession,
    EOrderStrategyType, EOrderType, IPlaceOrderConfig,
    placeOrder, EAssetType, IWriteResponse} from "tda-api-client";

const placeOrderConfig: IPlaceOrderConfig = {
    orderJSON: {
        orderType: EOrderType.MARKET,
        session: EOrderSession.NORMAL,
        duration: EOrderDuration.DAY,
        orderStrategyType: EOrderStrategyType.SINGLE,
        orderLegCollection: [
            {
                instruction: EOrderInstruction.BUY,
                quantity: 9,
                instrument: {
                    symbol: "F",
                    assetType: EAssetType.EQUITY,
                }
            },
        ],
    },
    accountId: 1
};
const result: IWriteResponse = await placeOrder(config);
```

## PRICE HISTORY
This request may be unauthenticated, using only your apikey.
### Get Price History
This is a doozy. The acceptable values for various inputs depend on other inputs. I've created objects indexed by the prerequisite object for convenience. See example below.
```typescript
import {
    EFrequencyQtyByFrequencyType,
    EFrequencyType,
    EFrequencyTypeByPeriodType,
    EPeriodQtyByPeriodType,
    EPeriodType,
    getPriceHistory,
    IPriceHistory,
    IPriceHistoryConfig
} from "tda-api-client";

const config: IPriceHistoryConfig = {
    symbol: "MSFT",
    periodType: EPeriodType.DAY,
    period: EPeriodQtyByPeriodType[EPeriodType.DAY].FIVE,
    frequencyType: EFrequencyTypeByPeriodType[EPeriodType.DAY].MINUTE,
    frequency: EFrequencyQtyByFrequencyType[EFrequencyType.MINUTE].THIRTY,
    getExtendedHours: true,
};
const result: IPriceHistory = await getPriceHistory(config);
```

## QUOTES
These requests may be unauthenticated, using only your apikey.

I recommend exclusively using Get Quotes, as it is more extensible, allowing multiple inputs and inputs with special characters, like `$SPX.X` or `/ES` or `EUR/USD`.
### Get Quote

```typescript
import {getQuote, IGetQuoteConfig, IQuoteResult} from "tda-api-client";

const config: IGetQuoteConfig = {
    symbol: "MSFT",
};
const result: IQuoteResult = await getQuote(config);
```

### Get Quotes

```typescript
import {getQuotes, IGetQuoteConfig, IQuoteResult} from "tda-api-client";

const symbols = ["MSFT", "/ES", "EUR/USD", "MSFT_011924C330"];
const config: IGetQuoteConfig = {
    symbol: symbols.join(","),
};
const result: IQuoteResult = await getQuotes(config);
```

## SAVED ORDERS
This can only be used if you have account advanced featured turned off. I haven't personally used these methods.
### Create Saved Order

Use the `.location` property of IWriteResponse and parse the new order number.
```typescript
import {createSavedOrder, ICreateSavedOrderConfig, 
    EOrderDuration, EOrderInstruction, EOrderSession,
    EOrderStrategyType, EOrderType, EAssetType, IWriteResponse
} from "tda-api-client";

const createSavedOrderConfig: ICreateSavedOrderConfig = {
    orderJSON: {
        orderType: EOrderType.MARKET,
        session: EOrderSession.NORMAL,
        duration: EOrderDuration.DAY,
        orderStrategyType: EOrderStrategyType.SINGLE,
        orderLegCollection: [
            {
                instruction: EOrderInstruction.BUY,
                quantity: 10,
                instrument: {
                    symbol: "F",
                    assetType: EAssetType.EQUITY,
                }
            }
        ]
    },
    accountId: 1
};
const createSavedOrderResult: IWriteResponse = await createSavedOrder(createSavedOrderConfig);
```

### Delete Saved Order

```typescript
import {deleteSavedOrder, ISimpleSavedOrderConfig} from "tda-api-client";

const deleteSavedOrderConfig: ISimpleSavedOrderConfig = {
    accountId: 1,
    savedOrderId: 123
};
await deleteSavedOrder(deleteSavedOrderConfig);
```

### Get Saved Order By Id

```typescript
import {IOrderGet, getSavedOrderById, ISimpleSavedOrderConfig} from "tda-api-client";

const getSavedOrderConfig: ISimpleSavedOrderConfig = {
    accountId: 1,
    savedOrderId: 123
};
const getSavedOrderResult: IOrderGet = await getSavedOrderById(getSavedOrderConfig);
```

### Get Saved Orders

```typescript
import {getSavedOrders, IGetSavedOrdersConfig, IOrderGet} from "tda-api-client";

const getSavedOrdersConfig: IGetSavedOrdersConfig = {
    accountId: 1
};
const getSavedOrdersResult: IOrderGet[] = await getSavedOrders(getSavedOrdersConfig);
```

### Replace Saved Order

Use the `.location` property of IWriteResponse and parse the new order number.
```typescript
import {IReplaceSaveOrderConfig, replaceSavedOrder, 
    EOrderDuration, EOrderInstruction, EOrderSession,
    EOrderStrategyType, EOrderType, EAssetType,
    IWriteResponse} from "tda-api-client";

const replaceSavedOrderConfig: IReplaceSaveOrderConfig = {
    orderJSON: {
        orderType: EOrderType.MARKET,
        session: EOrderSession.NORMAL,
        duration: EOrderDuration.DAY,
        orderStrategyType: EOrderStrategyType.SINGLE,
        orderLegCollection: [
            {
                instruction: EOrderInstruction.BUY,
                quantity: 10,
                instrument: {
                    symbol: "F",
                    assetType: EAssetType.EQUITY,
                }
            }
        ]
    },
    accountId: 1,
    savedOrderId: 123
};
const replaceSavedOrderResult: IWriteResponse = await replaceSavedOrder(replaceSavedOrderConfig);
```

## TRANSACTIONS
### Get Transaction

```typescript
import {getTransaction, IGetTransactionConfig, ITransaction} from "tda-api-client";

const config: IGetTransactionConfig = {
    accountId: 1,
    transactionId: 12345,
};
const resultSingle: ITransaction = await getTransaction(config);
```

### Get Transactions

```typescript
import {ETransactionType, getTransactions, IGetTransactionsConfig,
    ITransaction} from "tda-api-client";

const config: IGetTransactionsConfig = {
    accountId: 1,
    type: ETransactionType.ALL,
    startDate: "2022-01-01",
    endDate: "2022-01-20",
};
const result: ITransaction[] = await getTransactions(config);
```

## USER INFO
### Get User Preferences

```typescript
import {getUserPreferences, IGetUserPreferencesConfig,
    IPreferences} from "tda-api-client";

const config: IGetUserPreferencesConfig = {
    accountId: 1,
};

const result: IPreferences = await getUserPreferences(config);
```

### Get Streamer Subscription Keys

```typescript
import {getStreamerSubKeys, IGetStreamerKeysConfig,
    IStreamerSubKeys} from "tda-api-client";

const config: IGetStreamerKeysConfig = {
    accountIds: 1,
};

const result: IStreamerSubKeys = await getStreamerSubKeys(config);
```

### Update User Preferences

```typescript
import {
    EPrefAdvancedToolLaunch, EPrefAuthTokenTimeout,
    EPrefMarketSession,
    EPrefOrderDuration,
    EPrefOrderLegInstruction,
    EPrefPriceLinkType, EPrefTaxLotMethod,
    IPreferencesUpdate, IUpdateUserPrefConfig, updateUserPreferences,
    IWriteResponse} from "tda-api-client";

const preferences: IPreferencesUpdate = {
    expressTrading: false,
    defaultEquityOrderLegInstruction: EPrefOrderLegInstruction.NONE,
    defaultEquityOrderType: EPrefOrderType.LIMIT,
    defaultEquityOrderPriceLinkType: EPrefPriceLinkType.NONE,
    defaultEquityOrderDuration: EPrefOrderDuration.DAY,
    defaultEquityOrderMarketSession: EPrefMarketSession.NORMAL,
    defaultEquityQuantity: 100,
    mutualFundTaxLotMethod: EPrefTaxLotMethod.FIFO,
    optionTaxLotMethod: EPrefTaxLotMethod.FIFO,
    equityTaxLotMethod: EPrefTaxLotMethod.FIFO,
    defaultAdvancedToolLaunch: EPrefAdvancedToolLaunch.NONE,
    authTokenTimeout: EPrefAuthTokenTimeout.FIFTY_FIVE_MINUTES,
};

const updateUserPrefsConfig: IUpdateUserPrefConfig = {
    accountId: 1,
    preferencesJSON: preferences,
};
const updateUserPrefResult: IWriteResponse = await updateUserPreferences(updateUserPrefsConfig);
```

### Get User Principal Data
For `fields`, you can use a comma-separated string, string array, or array of enum values.

```typescript
import {EUserPrincipalFields, getUserPrincipals,
    IGetUserPrincipalsConfig, IUserPrincipal} from "tda-api-client";

const config: IGetUserPrincipalsConfig = {
    fields: [
        EUserPrincipalFields.STREAMER_CONNECTION_INFO,
        EUserPrincipalFields.PREFERENCES,
        EUserPrincipalFields.STREAMER_SUB_KEYS,
        EUserPrincipalFields.SURROGATE_IDS
    ],
};

const result: IUserPrincipal = await getUserPrincipals(config);
```

## WATCHLISTS
There is a convenience method called `createBasicWatchlistItem()` that exists just to give a basic shape.
### Update Watchlist
Use the `.location` property of IWriteResponse and parse the updated watchlist id.
```typescript
import {
    IWatchlistUpdateConfig, updateWatchlist,
    IWriteResponse, ICreateWatchlistItem, IWatchlistUpdate
} from "tda-api-client";

const items: ICreateWatchlistItem[] = [
    createBasicWatchlistItem("MSFT"),
    createBasicWatchlistItem("QQQ"),
];

const update: IWatchlistUpdate = {
    watchlistItems: items,
    name: "WLnamenew",
};

const updateConfig: IWatchlistUpdateConfig = {
    accountId: 1,
    watchlistId: 75,
    watchlistJSON: update,
};

const result: IWriteResponse = await updateWatchlist(updateConfig);
```

### Replace Watchlist
Use the `.location` property of IWriteResponse and parse the watchlist id.
```typescript
import {
    createBasicWatchlistItem, IWatchlistReplaceConfig,
    replaceWatchlist, IWriteResponse, IWatchlistItem,
    IWatchlistReplacement, IWatchlistReplacementItem
} from "tda-api-client";

const items: IWatchlistReplacementItem[] = [
    createBasicWatchlistItem("MSFT"),
    createBasicWatchlistItem("QQQ"),
];

const replacement: IWatchlistReplacement = {
    name: "mylist1",
    watchlistItems: items,
};

const replaceConfig: IWatchlistReplaceConfig = {
    accountId: 1,
    watchlistId: 78,
    watchlistJSON: replacement,
};

const result: IWriteResponse = await replaceWatchlist(replaceConfig);
```

### Get Watchlists Single Account

```typescript
import {getWatchlistsSingleAcct, IGetWatchlistsSingleAcctConfig,
    IWatchlist} from "tda-api-client";

const getConfig: IGetWatchlistsSingleAcctConfig = {
    accountId: 1,
};

const getResult: IWatchlist[] = await getWatchlistsSingleAcct(getConfig);
```

### Get Watchlists All Linked Accounts
No config is needed unless you are passing in auth info.

```typescript
import {getWatchlistsMultiAcct, IWatchlist} from "tda-api-client";

const getResult: IWatchlist[] = await getWatchlistsMultiAcct(getConfig);
```

### Get Single Watchlist

```typescript
import {getWatchlist, IGetWatchlistConfig, IWatchlist} from "tda-api-client";

const getConfig: IGetWatchlistConfig = {
    accountId: 1,
    watchlistId: 78,
};

const getResult: IWatchlist = await getWatchlist(getConfig);
```

### Delete Watchlist

```typescript
import {deleteWatchlist, IDeleteWatchlistConfig} from "tda-api-client";

const deleteConfig: IDeleteWatchlistConfig = {
    accountId: 1,
    watchlistId: 78,
};
await deleteWatchlist(deleteConfig);
```

### Create Watchlist
Use the `.location` property of IWriteResponse and parse the created watchlist id.
```typescript
import {
    createWatchlist, ICreateWatchlist,
    ICreateWatchlistConfig, IWriteResponse,
    ICreateWatchlistItem, createBasicWatchlistItem
} from "tda-api-client";

const wlItems: ICreateWatchlistItem[] = [
    createBasicWatchlistItem("SPY")
];

const newWatchlist: ICreateWatchlist = {
    name: "watchlistname",
    watchlistItems: wlItems,
};

const config: ICreateWatchlistConfig = {
    watchlistJSON: newWatchlist,
    accountId: 1,
};

const createResult: IWriteResponse = await createWatchlist(config);
```
