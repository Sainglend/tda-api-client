// Copyright (C) 2020-2 Aaron Satterlee

import {apiDelete, apiGet, apiPost, apiPut, IWriteResponse, TacRequestConfig} from "./tdapiinterface";
import {EAssetType, IInstrument} from "./sharedTypes";

export interface IReplaceOrderConfig extends IPlaceOrderConfig {
    orderId: string | number,
}

export interface IPlaceOrderConfig extends TacRequestConfig {
    accountId: string | number,
    orderJSON: any,
}

export interface IOrdersByAccountConfig extends IOrderSearchConfig {
    accountId: string | number,
}

export interface IOrdersByQueryConfig extends IOrderSearchConfig {
    accountId?: string | number,
}

interface IOrderSearchConfig extends TacRequestConfig {
    maxResults?: number,
    // yyyy-MM-dd
    fromEnteredTime?: string,
    // yyyy-MM-dd
    toEnteredTime?: string,
    status?: EOrderStatus | string,
}

export interface IGenericOrderConfig extends TacRequestConfig {
    accountId: string | number,
    orderId: string | number
}

export enum EOrderSession {
    NORMAL = "NORMAL",
    AM = "AM",
    PM = "PM",
    SEAMLESS = "SEAMLESS"
}

export enum EOrderDuration {
    DAY = "DAY",
    GOOD_TILL_CANCEL = "GOOD_TILL_CANCEL",
    FILL_OR_KILL = "FILL_OR_KILL"
}

export enum EOrderType {
    MARKET = "MARKET",
    LIMIT = "LIMIT",
    STOP = "STOP",
    STOP_LIMIT = "STOP_LIMIT",
    TRAILING_STOP = "TRAILING_STOP",
    MARKET_ON_CLOSE = "MARKET_ON_CLOSE",
    EXERCISE = "EXERCISE",
    TRAILING_STOP_LIMIT = "TRAILING_STOP_LIMIT",
    NET_DEBIT = "NET_DEBIT",
    NET_CREDIT = "NET_CREDIT",
    NET_ZERO = "NET_ZERO"
}

export interface IOrderTime {
    date: string,
    shortFormat: boolean // should default to false
}

export enum EComplexOrderStrategyType {
    NONE = "NONE",
    COVERED = "COVERED",
    VERTICAL = "VERTICAL",
    BACK_RATIO = "BACK_RATIO",
    CALENDAR = "CALENDAR",
    DIAGONAL = "DIAGONAL",
    STRADDLE = "STRADDLE",
    STRANGLE = "STRANGLE",
    COLLAR_SYNTHETIC = "COLLAR_SYNTHETIC",
    BUTTERFLY = "BUTTERFLY",
    CONDOR = "CONDOR",
    IRON_CONDOR = "IRON_CONDOR",
    VERTICAL_ROLL = "VERTICAL_ROLL",
    COLLAR_WITH_STOCK = "COLLAR_WITH_STOCK",
    DOUBLE_DIAGONAL = "DOUBLE_DIAGONAL",
    UNBALANCED_BUTTERFLY = "UNBALANCED_BUTTERFLY",
    UNBALANCED_CONDOR = "UNBALANCED_CONDOR",
    UNBALANCED_IRON_CONDOR = "UNBALANCED_IRON_CONDOR",
    UNBALANCED_VERTICAL_ROLL = "UNBALANCED_VERTICAL_ROLL",
    CUSTOM = "CUSTOM"
}

export enum EExchange {
    INET = "INET",
    ECN_ARCA = "ECN_ARCA",
    CBOE = "CBOE",
    AMEX = "AMEX",
    PHLX = "PHLX",
    ISE = "ISE",
    BOX = "BOX",
    NYSE = "NYSE",
    NASDAQ = "NASDAQ",
    BATS = "BATS",
    C2 = "C2",
    AUTO = "AUTO"
}

export enum EPriceLinkBasis {
    MANUAL = "MANUAL",
    BASE = "BASE",
    TRIGGER = "TRIGGER",
    LAST = "LAST",
    BID = "BID",
    ASK = "ASK",
    ASK_BID = "ASK_BID",
    MARK = "MARK",
    AVERAGE = "AVERAGE"
}

export enum EPriceLinkType {
    VALUE = "VALUE",
    PERCENT = "PERCENT",
    TICK = "TICK"
}

export enum EStopType {
    STANDARD = "STANDARD",
    BID = "BID",
    ASK = "ASK",
    LAST = "LAST",
    MARK = "MARK"
}

export enum ETaxLotMethod {
    FIFO = "FIFO",
    LIFO = "LIFO",
    HIGH_COST = "HIGH_COST",
    LOW_COST = "LOW_COST",
    AVERAGE_COST = "AVERAGE_COST",
    SPECIFIC_LOT = "SPECIFIC_LOT"
}

export enum EOrderInstruction {
    BUY = "BUY",
    SELL = "SELL",
    BUY_TO_COVER = "BUY_TO_COVER",
    SELL_SHORT = "SELL_SHORT",
    BUY_TO_OPEN = "BUY_TO_OPEN",
    BUY_TO_CLOSE = "BUY_TO_CLOSE",
    SELL_TO_OPEN = "SELL_TO_OPEN",
    SELL_TO_CLOSE = "SELL_TO_CLOSE",
    EXCHANGE = "EXCHANGE"
}

export enum EPositionEffect {
    OPENING = "OPENING",
    CLOSING = "CLOSING",
    AUTOMATIC = "AUTOMATIC"
}

export enum EQuantityType {
    ALL_SHARES = "ALL_SHARES",
    DOLLARS = "DOLLARS",
    SHARES = "SHARES"
}

export interface IOrderLeg {
    orderLegType?: EAssetType,
    legId?: string, // int64
    instrument: IInstrument,
    instruction: EOrderInstruction,
    positionEffect?: EPositionEffect,
    quantity: number, // double
    quantityType?: EQuantityType,
}

export enum ESpecialInstruction {
    ALL_OR_NONE = "ALL_OR_NONE",
    DO_NOT_REDUCE = "DO_NOT_REDUCE",
    ALL_OR_NONE_DO_NOT_REDUCE = "ALL_OR_NONE_DO_NOT_REDUCE"
}

export enum EOrderStrategyType {
    SINGLE = "SINGLE",
    OCO = "OCO",
    TRIGGER = "TRIGGER"
}

export enum EOrderStatus {
    AWAITING_PARENT_ORDER = "AWAITING_PARENT_ORDER",
    AWAITING_CONDITION = "AWAITING_CONDITION",
    AWAITING_MANUAL_REVIEW = "AWAITING_MANUAL_REVIEW",
    ACCEPTED = "ACCEPTED",
    AWAITING_UR_OUT = "AWAITING_UR_OUT",
    PENDING_ACTIVATION = "PENDING_ACTIVATION",
    QUEUED = "QUEUED",
    WORKING = "WORKING",
    REJECTED = "REJECTED",
    PENDING_CANCEL = "PENDING_CANCEL",
    CANCELED = "CANCELED",
    PENDING_REPLACE = "PENDING_REPLACE",
    REPLACED = "REPLACED",
    FILLED = "FILLED",
    EXPIRED = "EXPIRED"
}

export enum EActivityType {
    EXECUTION = "EXECUTION",
    ORDER_ACTION = "ORDER_ACTION"
}

export enum EExecutionType {
    FILL = "FILL"
}

export interface IExecutionLeg {
    legId: number, // int32
    quantity: number, // double
    mismarkedQuantity: number, // double
    price: number, // double
    time: string // date-time
}

export interface IOrderActivity {
    activityType: EActivityType,
    executionType: EExecutionType,
    quantity: number,
    orderRemainingQuantity: number,
    executionLegs: IExecutionLeg[]
}

export interface IOrderGet {
    session: EOrderSession,
    duration: EOrderDuration,
    orderType: EOrderType,
    cancelTime: IOrderTime,
    complexOrderStrategyType: EComplexOrderStrategyType,
    quantity: number, // double,
    filledQuantity: number, // double
    remainingQuantity: number, // double
    requestedDestination: EExchange,
    destinationLinkName: string,
    releaseTime: string // date-time
    stopPrice: number // double
    stopPriceLinkBasis: EPriceLinkBasis,
    stopPriceLinkType: EPriceLinkType,
    stopPriceOffset: number, // double
    stopType: EStopType,
    priceLinkBasis: EPriceLinkBasis,
    priceLinkType: EPriceLinkType,
    price: number, // double
    taxLotMethod: ETaxLotMethod,
    orderLegCollection: IOrderLeg[],
    activationPrice: number, // double
    specialInstruction: ESpecialInstruction,
    orderStrategyType: EOrderStrategyType,
    orderId: number, // int64
    cancelable: boolean, // default false
    editable: boolean, // default false
    status: EOrderStatus,
    enteredTime: string, // date-time
    closeTime: string, // date-time
    tag: string,
    accountId: number, // int64
    orderActivityCollection: IOrderActivity[],
    replacingOrderCollection: IOrderStrategy[],
    childOrderStrategies: IOrderStrategy[],
    statusDescription: string,
}

export interface IOrderStrategy {
    session: EOrderSession,
    duration: EOrderDuration,
    orderType: EOrderType,
    orderStrategyType: EOrderStrategyType,
    cancelTime?: IOrderTime,
    complexOrderStrategyType?: EComplexOrderStrategyType,
    quantity?: number, // double,
    filledQuantity?: number, // double
    remainingQuantity?: number, // double
    requestedDestination?: EExchange,
    destinationLinkName?: string,
    releaseTime?: string // date-time
    stopPrice?: number // double
    stopPriceLinkBasis?: EPriceLinkBasis,
    stopPriceLinkType?: EPriceLinkType,
    stopPriceOffset?: number, // double
    stopType?: EStopType,
    priceLinkBasis?: EPriceLinkBasis,
    priceLinkType?: EPriceLinkType,
    price?: number, // doubleEA
    taxLotMethod?: ETaxLotMethod,
    orderLegCollection?: IOrderLeg[],
    activationPrice?: number, // double
    specialInstruction?: ESpecialInstruction,
    orderId?: number, // int64
    cancelable?: boolean, // default false
    editable?: boolean, // default false
    status?: EOrderStatus,
    enteredTime?: string, // date-time
    closeTime?: string, // date-time
    tag?: string,
    accountId?: number, // int64
    orderActivityCollection?: IOrderActivity[],
    replacingOrderCollection?: IOrderStrategy[],
    childOrderStrategies?: IOrderStrategy[],
    statusDescription?: string
}

/**
 * Replace an existing order by a specified account using the properly formatted orderJSON
 * The new order number can be parsed from the location property on the return object
 * See order examples at: https://developer.tdameritrade.com/content/place-order-samples
 * Not rate limited so never queued unless specifically overridden.
 */
export async function replaceOrder(config: IReplaceOrderConfig): Promise<IWriteResponse> {
    config.path = `/v1/accounts/${config.accountId}/orders/${config.orderId}`;
    config.bodyJSON = config.orderJSON;
    return await apiPut({ queueSettings: { enqueue: false }, ...config });
}

/**
 * Place a new order for a specified account using the properly formatted orderJSON.
 * The order number can be parsed from the url returned in the location property.
 * See order examples at: https://developer.tdameritrade.com/content/place-order-samples
 * Not rate limited so never queued unless specifically overridden.
 */
export async function placeOrder(config: IPlaceOrderConfig): Promise<IWriteResponse> {
    return await apiPost({
        queueSettings: { enqueue: false },
        ...config,
        bodyJSON: config.orderJSON,
        path: `/v1/accounts/${config.accountId}/orders`,
    });
}

/**
 * Get all orders for a specified account, possibly filtered by time and order status
 * Takes accountId, and optionally: maxResults, fromEnteredTime, toEnteredTime
 * (times must either both be included or omitted), status (ENUM is ORDER_STATUS)
 * Not rate limited so never queued unless specifically overridden.
 */
export async function getOrdersByAccount(config: any): Promise<IOrderGet[]> {
    config.path = `/v1/accounts/${config.accountId}/orders?` +
        (config.maxResults ? `maxResults=${config.maxResults}&` : "") +
        (config.fromEnteredTime ? `fromEnteredTime=${config.fromEnteredTime}&` : "") +
        (config.toEnteredTime ? `toEnteredTime=${config.toEnteredTime}&` : "") +
        (config.status ? `status=${config.status}` : "");

    return await apiGet({ queueSettings: { enqueue: false }, ...config });
}

/**
 * Get all orders for all linked accounts, or just a specified account if config.accountId is provided, possibly filtered by time and order status
 * Not rate limited so never queued unless specifically overridden.
 */
export async function getOrdersByQuery(config: IOrdersByQueryConfig): Promise<IOrderGet[]> {
    config.path = `/v1/orders?` +
        (config.accountId ? `accountId=${config.accountId}&` : "") +
        (config.maxResults ? `maxResults=${config.maxResults}&` : "") +
        (config.fromEnteredTime ? `fromEnteredTime=${config.fromEnteredTime}&` : "") +
        (config.toEnteredTime ? `toEnteredTime=${config.toEnteredTime}&` : "") +
        (config.status ? `status=${config.status}` : "");

    return await apiGet({ queueSettings: { enqueue: false }, ...config });
}

/**
 * Get a specific order for a specific account
 * Not rate limited so never queued unless specifically overridden.
 */
export async function getOrder(config: IGenericOrderConfig): Promise<IOrderGet> {
    config.path = `/v1/accounts/${config.accountId}/orders/${config.orderId}`;
    return await apiGet({ queueSettings: { enqueue: false }, ...config });
}

/**
 * Cancel an order that was placed by the specified account
 * Not rate limited so never queued unless specifically overridden.
 */
export async function cancelOrder(config: IGenericOrderConfig): Promise<any> {
    config.path = `/v1/accounts/${config.accountId}/orders/${config.orderId}`;
    return await apiDelete({ queueSettings: { enqueue: false }, ...config });
}

/**
 * Helper method for constructing order JSON for an EQUITY LIMIT BUY order with DAY time in effect.
 */
export function generateBuyLimitEquityOrder(
    {
        symbol,
        price,
        quantity,
    } : {
        symbol: string,
        price: number,
        quantity: number
    }): IOrderStrategy
{
    return {
        orderType: EOrderType.LIMIT,
        price,
        session: EOrderSession.NORMAL,
        duration: EOrderDuration.DAY,
        orderStrategyType: EOrderStrategyType.SINGLE,
        orderLegCollection: [
            {
                instruction: EOrderInstruction.BUY,
                quantity,
                instrument: {
                    symbol,
                    assetType: EAssetType.EQUITY,
                },
            },
        ],
    };
}

/**
 * Helper method for constructing order JSON for an EQUITY MARKET BUY order with DAY time in effect.
 */
export function generateBuyMarketEquityOrder(
    {
        symbol,
        quantity,
    } : {
        symbol: string,
        quantity: number
    }): IOrderStrategy
{
    return {
        orderType: EOrderType.MARKET,
        session: EOrderSession.NORMAL,
        duration: EOrderDuration.DAY,
        orderStrategyType: EOrderStrategyType.SINGLE,
        orderLegCollection: [
            {
                instruction: EOrderInstruction.BUY,
                quantity,
                instrument: {
                    symbol,
                    assetType: EAssetType.EQUITY,
                },
            },
        ],
    };
}
