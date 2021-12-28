// Copyright (C) 2020-1  Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";
import {IInstrument} from "./sharedTypes";
import {IOrderStrategy} from "./orders";

export interface IAccountBalance {
    accruedInterest: number,
    availableFundsNonMarginableTrade: number,
    bondValue: number,
    buyingPower: number,
    cashBalance: number,
    cashAvailableForTrading: number,
    cashReceipts: number,
    dayTradingBuyingPower: number,
    dayTradingBuyingPowerCall: number,
    dayTradingEquityCall: number,
    equity: number,
    equityPercentage: number,
    liquidationValue: number,
    longMarginValue: number,
    longOptionMarketValue: number,
    longStockValue: number,
    maintenanceCall: number,
    maintenanceRequirement: number,
    margin: number,
    marginEquity: number,
    moneyMarketFund: number,
    mutualFundValue: number,
    regTCall: number,
    shortMarginValue: number,
    shortOptionMarketValue: number,
    shortStockValue: number,
    totalCash: number,
    isInCall: boolean,
    pendingDeposits: number,
    marginBalance: number,
    shortBalance: number,
    accountValue: number
}

export interface IProjectedBalance {
    availableFunds: number,
    availableFundsNonMarginableTrade: number,
    buyingPower: number,
    dayTradingBuyingPower: number,
    dayTradingBuyingPowerCall: number,
    maintenanceCall: number,
    regTCall: number,
    isInCall: boolean,
    stockBuyingPower: number
}

export interface ICurrentBalance {
    accruedInterest: number,
    cashBalance: number,
    cashReceipts: number,
    longOptionMarketValue: number,
    liquidationValue: number,
    longMarketValue: number,
    moneyMarketFund: number,
    savings: number,
    shortMarketValue: number,
    pendingDeposits: number,
    availableFunds: number,
    availableFundsNonMarginableTrade: number,
    buyingPower: number,
    buyingPowerNonMarginableTrade: number,
    dayTradingBuyingPower: number,
    equity: number,
    equityPercentage: number,
    longMarginValue: number,
    maintenanceCall: number,
    maintenanceRequirement: number,
    marginBalance: number,
    regTCall: number,
    shortBalance: number,
    shortMarginValue: number,
    shortOptionMarketValue: number,
    sma: number,
    mutualFundValue: number,
    bondValue: number
}

export interface IAccountPosition {
    shortQuantity: number,
    averagePrice: number,
    currentDayProfitLoss: number,
    currentDayProfitLossPercentage: number,
    longQuantity: number,
    settledLongQuantity: number,
    settledShortQuantity: number,
    agedQuantity: number,
    instrument: IInstrument,
    marketValue: number,
    maintenanceRequirement: number,
    currentDayCost: number,
    previousSessionLongQuantity: number,
}

export interface IAccount {
    securitiesAccount: ISecuritiesAccount
}

export interface ISecuritiesAccount {
    type: string,
    accountId: string,
    roundTrips: number,
    isDayTrader: boolean,
    isClosingOnlyRestricted: boolean,
    positions: IAccountPosition[],
    orderStrategies: IOrderStrategy[],
    initialBalances: IAccountBalance,
    currentBalances: ICurrentBalance,
    projectedBalances: IProjectedBalance,
}

export interface IGetAccountConfig extends TacRequestConfig {
    accountId: string | number,
    fields?: string | EGetAccountField[],
}

export interface IGetAccountsConfig extends TacRequestConfig {
    fields?: string | EGetAccountField[],
}

export enum EGetAccountField {
    POSITIONS = "positions",
    ORDERS = "orders",
}


/**
 * Gets account info for a single account. You can request additional fields with config.fields as a comma-separated string.
 * Possible values for fields are: positions, orders
 */
export async function getAccount(config: IGetAccountConfig): Promise<IAccount> {
    let fields = config.fields;
    if (Array.isArray(config.fields)) fields = config.fields.join(",");
    config.path = `/v1/accounts/${config.accountId}` +
        (fields ? `?fields=${fields}` : "");
    return await apiGet(config);
}

/**
 * Gets account info for all linked accounts. You can request additional fields with config.fields as a comma-separated string.
 * Possible values for fields are: positions, orders
 */
export async function getAccounts(config: IGetAccountsConfig): Promise<IAccount[]> {
    let fields = config.fields;
    if (Array.isArray(config.fields)) fields = config.fields.join(",");
    config.path = `/v1/accounts` +
        (fields ? `?fields=${fields}` : "");
    return await apiGet(config);
}
