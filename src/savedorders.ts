// Copyright (C) 2020-1 Aaron Satterlee

import {apiDelete, apiGet, apiPost, apiPut} from "./tdapiinterface";

/**
 * Create a saved order for a given account
 * @param {Object} config - takes accountId, orderJSON
 * @returns {Promise<Object>} api POST result
 * @async
 */
export async function createSavedOrder(config: any) {
    config.bodyJSON = config.orderJSON;
    config.path = `/v1/accounts/${config.accountId}/savedorders`;

    return apiPost(config);
}

/**
 * Delete a specified saved order for a given account
 * @param {Object} config - takes accountId, savedOrderId
 * @returns {Promise<Object>} api DELETE result
 * @async
 */
export async function deleteSavedOrder(config: any) {
    if (!config) config = {};
    config.path = `/v1/accounts/${config.accountId}/savedorders/${config.savedOrderId}`;

    return apiDelete(config);
}

/**
 * Get a particular saved order for a given account
 * @param {Object} config - takes accountId, savedOrderId
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getSavedOrderById(config: any) {
    config.path = `/v1/accounts/${config.accountId}/savedorders/${config.savedOrderId}`;

    return apiGet(config);
}

/**
 * Get all saved orders for a given account
 * @param {Object} config - takes accountId
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getSavedOrders(config: any) {
    config.path = `/v1/accounts/${config.accountId}/savedorders`;

    return apiGet(config);
}

/**
 * Replace an existing saved order for a specified account using the properly formatted orderJSON
 * @param {Object} config - takes accountId, savedOrderId, orderJSON
 * @returns {Promise<Object>} api PUT result
 * @async
 */
export async function replaceSavedOrder(config: any) {
    config.bodyJSON = config.orderJSON;
    config.path = `/v1/accounts/${config.accountId}/savedorders/${config.savedOrderId}`;

    return apiPut(config);
}
