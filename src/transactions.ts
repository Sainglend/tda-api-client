// Copyright (C) 2020-1 Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";
import {IInstrument_Transaction} from "./types_AA";

/**
 * Enum for the transaction types
 * @enum
 */
export enum TRANSACTION_TYPE {
    ALL = 'ALL',
    TRADE = 'TRADE',
    BUY_ONLY = 'BUY_ONLY',
    SELL_ONLY = 'SELL_ONLY',
    CASH_IN_OR_CASH_OUT = 'CASH_IN_OR_CASH_OUT',
    CHECKING = 'CHECKING',
    DIVIDEND = 'DIVIDEND',
    INTEREST = 'INTEREST',
    OTHER = 'OTHER',
    ADVISOR_FEES = 'ADVISOR_FEES',
}

export enum ETransactionType {
    TRADE = "TRADE",
    RECEIVE_AND_DELIVER = "RECEIVE_AND_DELIVER",
    DIVIDEND_OR_INTEREST = "DIVIDEND_OR_INTEREST",
    ACH_RECEIPT = "ACH_RECEIPT",
    ACH_DISBURSEMENT = "ACH_DISBURSEMENT",
    CASH_RECEIPT = "CASH_RECEIPT",
    CASH_DISBURSEMENT = "CASH_DISBURSEMENT",
    ELECTRONIC_FUND = "ELECTRONIC_FUND",
    WIRE_OUT = "WIRE_OUT",
    WIRE_IN = "WIRE_IN",
    JOURNAL = "JOURNAL",
    MEMORANDUM = "MEMORANDUM",
    MARGIN_CALL = "MARGIN_CALL",
    MONEY_MARKET = "MONEY_MARKET",
    SMA_ADUSTMENT = "SMA_ADUSTMENT",
}

export enum EAchStatus {
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCEL = "CANCEL",
    ERROR = "ERROR",
}

export interface ITransactionItem {
    accountId: number,
    amount: number,
    price: number,
    cost: number,
    parentOrderKey: number,
    parentChildIndicator: string,
    instruction: string,
    positionEffect: string,
    "instrument": IInstrument_Transaction,
}

export interface ITransaction {
    type: ETransactionType,
    clearingReferenceNumber: string,
    subAccount: string,
    settlementDate: string,
    orderId: string,
    sma: number,
    requirementReallocationAmount: number,
    dayTradeBuyingPowerEffect: number,
    netAmount: number,
    transactionDate: string,
    orderDate: string,
    transactionSubType: string,
    transactionId: number,
    cashBalanceEffectFlag: boolean,
    description: string,
    achStatus: EAchStatus,
    accruedInterest: number,
    fees: {[index:string]: number},
    "transactionItem": ITransactionItem[],
}

export interface IGetTransactionsConfig extends TacRequestConfig {
    accountId: string | number,
    type?: TRANSACTION_TYPE,
    symbol?: string,
    startDate?: string,
    endDate?: string,
}

export interface IGetTransactionConfig extends TacRequestConfig {
    accountId: string | number,
    transactionId: string | number,
}

/**
 * Gets all transactions for a specific account with the set options, such as symbol, type,
 * startDate (yyyy-MM-dd), endDate (yyyy-MM-dd) (maximum time span is 1 year)
 */
export async function getTransactions(config: IGetTransactionsConfig): Promise<ITransaction[]> {
    config.path = `/v1/accounts/${config.accountId}/transactions?` +
        (config.type ? `type=${config.type}&` : '') +
        (config.startDate ? `startDate=${config.startDate}&` : '') +
        (config.endDate ? `endDate=${config.endDate}&` : '') +
        (config.symbol ? `symbol=${config.symbol}` : '');

    return await apiGet(config);
}

/**
 * Get a sepcific transaction for a specified account
 */
export async function getTransaction(config: IGetTransactionConfig): Promise<ITransaction> {
    config.path = `/v1/accounts/${config.accountId}/transactions/${config.transactionId}`;

    return await apiGet(config);
}
