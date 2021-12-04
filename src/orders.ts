// Copyright (C) 2020-1 Aaron Satterlee

import {apiDelete, apiGet, apiPost, apiPut} from "./tdapiinterface";

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

    return apiPut(config);
}

/**
 * Place a new order for a specified account using the properly formatted orderJSON
 * @param {Object} config - takes accountId, orderJSON
 * @returns {Promise<Object>} api POST result
 * @async
 */
export async function placeOrder(config: any) {
    config.bodyJSON = config.orderJSON;
    config.path = `/v1/accounts/${config.accountId}/orders`;

    return apiPost(config);
}

/**
 * Get all orders for a specified account, possibly filtered by time and order status
 * @param {Object} config - takes accountId, and optionally: maxResults,
 * fromEnteredTime, toEnteredTime (times must either both be included or omitted), status (ENUM is ORDER_STATUS)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getOrdersByAccount(config: any) {
    config.path = `/v1/accounts/${config.accountId}/orders?` +
        (config.maxResults ? `maxResults=${config.maxResults}&` : '') +
        (config.fromEnteredTime ? `fromEnteredTime=${config.fromEnteredTime}&` : '') +
        (config.toEnteredTime ? `toEnteredTime=${config.toEnteredTime}&` : '') +
        (config.status ? `status=${config.status}` : '');

    return apiGet(config);
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

    return apiGet(config);
}

/**
 * Get a specific order for a sepecific account
 * @param {Object} config - takes accountId, orderId
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getOrder(config: any) {
    config.path = `/v1/accounts/${config.accountId}/orders/${config.orderId}`;

    return apiGet(config);
}

/**
 * Cancel an order that was placed by the specified account
 * @param {Object} config - takes accountId, orderId
 * @returns {Promise<Object>} api DELETE result
 * @async
 */
export async function cancelOrder(config: any) {
    config.path = `/v1/accounts/${config.accountId}/orders/${config.orderId}`;

    return apiDelete(config);
}
