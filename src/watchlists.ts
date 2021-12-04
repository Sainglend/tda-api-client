// Copyright (C) 2020-1  Aaron Satterlee

import {apiDelete, apiGet, apiPatch, apiPost, apiPut} from "./tdapiinterface";

/**
 * Create a new watchlist for a specified accountId using watchlistJSON
 * @param {Object} config - takes accountId, watchlistJSON
 * @returns {Promise<Object>} api PATCH result
 * @async
 */
export async function createWatchlist(config: any) {
    config.bodyJSON = config.watchlistJSON;
    config.path = `/v1/accounts/${config.accountId}/watchlists`;

    return apiPost(config);
}

/**
 * Delete a single watchlist having watchlistId for a specified accountId
 * @param {Object} config - takes accountId, watchlistId
 * @returns {Promise<Object>} api DELETE result
 * @async
 */
export async function deleteWatchlist(config: any) {
    config.path = `/v1/accounts/${config.accountId}/watchlists/${config.watchlistId}`;

    return apiDelete(config);
}

/**
 * Get a single watchlist having watchlistId for a specified accountId
 * @param {Object} config - takes accountId, watchlistId
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getWatchlist(config: any) {
    config.path = `/v1/accounts/${config.accountId}/watchlists/${config.watchlistId}`;

    return apiGet(config);
}


/**
 * Get all watchlists for all linked accounts
 * @param {Object} config - (no input required)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getWatchlistsMultiAcct(config: any) {
    if (!config) config = {};
    config.path = `/v1/accounts/watchlists`;

    return apiGet(config);
}


/**
 * Get all watchlists for a single account with specified accountId
 * @param {Object} config - takes accountId
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getWatchlistsSingleAcct(config: any) {
    config.path = `/v1/accounts/${config.accountId}/watchlists`;

    return apiGet(config);
}


/**
 * Replace an entire watchlist having watchlistId for a specified accountId using watchlistJSON
 * @param {Object} config - takes accountId, watchlistId, watchlistJSON
 * @returns {Promise<Object>} api PUT result
 * @async
 */
export async function replaceWatchlist(config: any) {
    config.bodyJSON = config.watchlistJSON;
    config.path = `/v1/accounts/${config.accountId}/watchlists/${config.watchlistId}`;

    return apiPut(config);
}


/**
 * Append/update in place a watchlist having watchlistId for a specified accountId using watchlistJSON
 * @param {Object} config - takes accountId, watchlistId, watchlistJSON
 * @returns {Promise<Object>} api PATCH result
 * @async
 */
export async function updateWatchlist(config: any) {
    config.bodyJSON = config.watchlistJSON;
    config.path = `/v1/accounts/${config.accountId}/watchlists/${config.watchlistId}`;

    return apiPatch(config);
}
