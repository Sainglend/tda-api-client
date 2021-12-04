// Copyright (C) 2020-1  Aaron Satterlee

import {apiGet} from "./tdapiinterface";

/**
 * Gets account info for a single account. You can request additional fields with config.fields as a comma-separated string.
 * Possible values for fields are: positions, orders
 * @param {Object} config - takes accountId, fields (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getAccount(config: any) {
    config.path = `/v1/accounts/${config.accountId}` +
        (config.fields ? `?fields=${config.fields}` : '');

    return apiGet(config);
}

/**
 * Gets account info for all linked accounts. You can request additional fields with config.fields as a comma-separated string.
 * Possible values for fields are: positions, orders
 * @param {Object} config - takes fields (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getAccounts(config: any) {
    config.path = `/v1/accounts` +
        (config.fields ? `?fields=${config.fields}` : '');

    return apiGet(config);
}
