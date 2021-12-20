// Copyright (C) 2020-1 Aaron Satterlee

import {apiDelete, apiGet, apiPost, apiPut, IWriteResponse, TacBaseConfig, TacRequestConfig} from "./tdapiinterface";
import {IInstrument} from "./sharedTypes";

/**
 * Enum for order statuses, to use when retrieving account orders.
 * @enum
 */
export enum ORDER_STATUS {
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
    EXPIRED = "EXPIRED",
}

/**
 * Replace an existing order by a specified account using the properly formatted orderJSON
 * @param {Object} config - takes accountId, orderId, orderJSON
 * @returns {Promise<Object>} api PUT result
 * @async
 */
export async function replaceOrder(config: any) {
    config.bodyJSON = config.orderJSON;
    config.path = `/v1/accounts/${config.accountId}/orders/${config.orderId}`;

    return await apiPut(config);
}

/**
 * Place a new order for a specified account using the properly formatted orderJSON.
 * The order number can be parsed from the url returned in the location property.
 */
export async function placeOrder(config: IPlaceOrderConfig): Promise<IWriteResponse> {
    return await apiPost({
        ...config,
        bodyJSON: config.orderJSON,
        path: `/v1/accounts/${config.accountId}/orders`
    });
}

export interface IPlaceOrderConfig extends TacBaseConfig {
    accountId: string | number,
    orderJSON: any,
}

/**
 * Get all orders for a specified account, possibly filtered by time and order status
 * Takes accountId, and optionally: maxResults, fromEnteredTime, toEnteredTime
 * (times must either both be included or omitted), status (ENUM is ORDER_STATUS)
 */
export async function getOrdersByAccount(config: any) {
    config.path = `/v1/accounts/${config.accountId}/orders?` +
        (config.maxResults ? `maxResults=${config.maxResults}&` : '') +
        (config.fromEnteredTime ? `fromEnteredTime=${config.fromEnteredTime}&` : '') +
        (config.toEnteredTime ? `toEnteredTime=${config.toEnteredTime}&` : '') +
        (config.status ? `status=${config.status}` : '');

    return await apiGet(config);
}

/**
 * Get all orders for all linked accounts, or just a specified account if config.accountId is provided, possibly filtered by time and order status
 * @param {Object} config - takes optional arguments: accountId, maxResults,
 * fromEnteredTime, toEnteredTime (times must either both be included or omitted), status (ENUM is ORDER_STATUS)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getOrdersByQuery(config: any) {
    config.path = `/v1/orders?` +
        (config.accountId ? `accountId=${config.accountId}&` : '') +
        (config.maxResults ? `maxResults=${config.maxResults}&` : '') +
        (config.fromEnteredTime ? `fromEnteredTime=${config.fromEnteredTime}&` : '') +
        (config.toEnteredTime ? `toEnteredTime=${config.toEnteredTime}&` : '') +
        (config.status ? `status=${config.status}` : '');

    return await apiGet(config);
}

/**
 * Get a specific order for a sepecific account
 * @param {Object} config - takes accountId, orderId
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getOrder(config: IGetOrderConfig): Promise<IOrderGet> {
    config.path = `/v1/accounts/${config.accountId}/orders/${config.orderId}`;

    return await apiGet(config);
}

export interface IGetOrderConfig extends TacRequestConfig {
    accountId: string | number,
    orderId: string | number
}

/**
 * Cancel an order that was placed by the specified account
 * @param {Object} config - takes accountId, orderId
 * @returns {Promise<Object>} api DELETE result
 * @async
 */
export async function cancelOrder(config: any) {
    config.path = `/v1/accounts/${config.accountId}/orders/${config.orderId}`;

    return await apiDelete(config);
}

export enum EOrderSession {
    NORMAL = 'NORMAL',
    AM = 'AM',
    PM = 'PM',
    SEAMLESS = 'SEAMLESS'
}

export enum EOrderDuration {
    DAY = 'DAY',
    GOOD_TILL_CANCEL = 'GOOD_TILL_CANCEL',
    FILL_OR_KILL = 'FILL_OR_KILL'
}

export enum EOrderType {
    MARKET = 'MARKET',
    LIMIT = 'LIMIT',
    STOP = 'STOP',
    STOP_LIMIT = 'STOP_LIMIT',
    TRAILING_STOP = 'TRAILING_STOP',
    MARKET_ON_CLOSE = 'MARKET_ON_CLOSE',
    EXERCISE = 'EXERCISE',
    TRAILING_STOP_LIMIT = 'TRAILING_STOP_LIMIT',
    NET_DEBIT = 'NET_DEBIT',
    NET_CREDIT = 'NET_CREDIT',
    NET_ZERO = 'NET_ZERO'
}

export interface IOrderTime {
    date: string,
    shortFormat: boolean // should default to false
}

export enum EComplexOrderStrategyType {
    NONE = 'NONE',
    COVERED = 'COVERED',
    VERTICAL = 'VERTICAL',
    BACK_RATIO = 'BACK_RATIO',
    CALENDAR = 'CALENDAR',
    DIAGONAL = 'DIAGONAL',
    STRADDLE = 'STRADDLE',
    STRANGLE = 'STRANGLE',
    COLLAR_SYNTHETIC = 'COLLAR_SYNTHETIC',
    BUTTERFLY = 'BUTTERFLY',
    CONDOR = 'CONDOR',
    IRON_CONDOR = 'IRON_CONDOR',
    VERTICAL_ROLL = 'VERTICAL_ROLL',
    COLLAR_WITH_STOCK = 'COLLAR_WITH_STOCK',
    DOUBLE_DIAGONAL = 'DOUBLE_DIAGONAL',
    UNBALANCED_BUTTERFLY = 'UNBALANCED_BUTTERFLY',
    UNBALANCED_CONDOR = 'UNBALANCED_CONDOR',
    UNBALANCED_IRON_CONDOR = 'UNBALANCED_IRON_CONDOR',
    UNBALANCED_VERTICAL_ROLL = 'UNBALANCED_VERTICAL_ROLL',
    CUSTOM = 'CUSTOM'
}

export enum EExchange {
    INET = 'INET',
    ECN_ARCA = 'ECN_ARCA',
    CBOE = 'CBOE',
    AMEX = 'AMEX',
    PHLX = 'PHLX',
    ISE = 'ISE',
    BOX = 'BOX',
    NYSE = 'NYSE',
    NASDAQ = 'NASDAQ',
    BATS = 'BATS',
    C2 = 'C2',
    AUTO = 'AUTO'
}

export enum EPriceLinkBasis {
    MANUAL = 'MANUAL',
    BASE = 'BASE',
    TRIGGER = 'TRIGGER',
    LAST = 'LAST',
    BID = 'BID',
    ASK = 'ASK',
    ASK_BID = 'ASK_BID',
    MARK = 'MARK',
    AVERAGE = 'AVERAGE'
}

export enum EPriceLinkType {
    VALUE = 'VALUE',
    PERCENT = 'PERCENT',
    TICK = 'TICK'
}

export enum EStopType {
    STANDARD = 'STANDARD',
    BID = 'BID',
    ASK = 'ASK',
    LAST = 'LAST',
    MARK = 'MARK'
}

export enum ETaxLotMethod {
    FIFO = 'FIFO',
    LIFO = 'LIFO',
    HIGH_COST = 'HIGH_COST',
    LOW_COST = 'LOW_COST',
    AVERAGE_COST = 'AVERAGE_COST',
    SPECIFIC_LOT = 'SPECIFIC_LOT'
}

export enum EOrderInstruction {
    BUY = 'BUY',
    SELL = 'SELL',
    BUY_TO_COVER = 'BUY_TO_COVER',
    SELL_SHORT = 'SELL_SHORT',
    BUY_TO_OPEN = 'BUY_TO_OPEN',
    BUY_TO_CLOSE = 'BUY_TO_CLOSE',
    SELL_TO_OPEN = 'SELL_TO_OPEN',
    SELL_TO_CLOSE = 'SELL_TO_CLOSE',
    EXCHANGE = 'EXCHANGE'
}

export enum EPositionEffect {
    OPENING = 'OPENING',
    CLOSING = 'CLOSING',
    AUTOMATIC = 'AUTOMATIC'
}

export enum EQuantityType {
    ALL_SHARES = 'ALL_SHARES',
    DOLLARS = 'DOLLARS',
    SHARES = 'SHARES'
}

export enum EAssetType {
    EQUITY,
    OPTION,
    INDEX,
    MUTUAL_FUND,
    CASH_EQUIVALENT,
    FIXED_INCOME,
    CURRENCY,
}

export interface IOrderLeg {
    orderLegType: EAssetType,
    legId: string, // int64
    instrument: IInstrument,
    instruction: EOrderInstruction,
    positionEffect: EPositionEffect,
    quantity: number, // double
    quantityType: EQuantityType
}

export enum ESpecialInstruction {
    ALL_OR_NONE = 'ALL_OR_NONE',
    DO_NOT_REDUCE = 'DO_NOT_REDUCE',
    ALL_OR_NONE_DO_NOT_REDUCE = 'ALL_OR_NONE_DO_NOT_REDUCE'
}

export enum EOrderStrategyType {
    SINGLE = 'SINGLE',
    OCO = 'OCO',
    TRIGGER = 'TRIGGER'
}

export enum EOrderStatus {
    AWAITING_PARENT_ORDER = 'AWAITING_PARENT_ORDER',
    AWAITING_CONDITION = 'AWAITING_CONDITION',
    AWAITING_MANUAL_REVIEW = 'AWAITING_MANUAL_REVIEW',
    ACCEPTED = 'ACCEPTED',
    AWAITING_UR_OUT = 'AWAITING_UR_OUT',
    PENDING_ACTIVATION = 'PENDING_ACTIVATION',
    QUEUED = 'QUEUED',
    WORKING = 'WORKING',
    REJECTED = 'REJECTED',
    PENDING_CANCEL = 'PENDING_CANCEL',
    CANCELED = 'CANCELED',
    PENDING_REPLACE = 'PENDING_REPLACE',
    REPLACED = 'REPLACED',
    FILLED = 'FILLED',
    EXPIRED = 'EXPIRED'
}

export enum EActivityType {
    EXECUTION = 'EXECUTION',
    ORDER_ACTION = 'ORDER_ACTION'
}

export enum EExecutionType {
    FILL = 'FILL'
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

export interface IExecution extends IOrderActivity {
    // this space intentionally left blank as subclass adds nothing
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
    price: number, // doubleEA
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
    statusDescription: string
}
