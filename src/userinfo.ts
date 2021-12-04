// Copyright (C) 2020-1 Aaron Satterlee

import {apiGet, apiPut} from "./tdapiinterface";

/**
 * Get user preferences for a given accountId
 * @param {Object} config - takes accountId
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getUserPreferences(config: any) {
    config.path = `/v1/accounts/${config.accountId}/preferences`;

    return apiGet(config);
}

/**
 * Get streamer subscription keys for given accountIds as a comma-separated list: 123,345
 * @param {Object} config - takes accountIds
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getStreamerSubKeys(config: any) {
    config.path = `/v1/userprincipals/streamersubscriptionkeys?accountIds=${config.accountIds}`;

    return apiGet(config);
}

/**
 * Update user preferences for a given accountId using a preferencesJSON
 * @param {Object} config - takes accountId, preferencesJSON
 * @returns {Promise<Object>} api PUT result
 * @async
 */
export async function updateUserPreferences(config: any) {
    config.bodyJSON = config.preferencesJSON;
    config.path = `/v1/accounts/${config.accountId}/preferences`;

    return apiPut(config);
}

/**
 * Get user info. Return additional fields with the config.fields param, a comma-separated string of up to 4 fields: streamerSubscriptionKeys, streamerConnectionInfo, preferences, surrogateIds
 * @param {Object} config - fields
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getUserPrincipals(config: any) {
    config.path = `/v1/userprincipals?fields=${config.fields}`;

    return apiGet(config);
}
