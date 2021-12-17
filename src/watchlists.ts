// Copyright (C) 2020-1  Aaron Satterlee

import {apiDelete, apiGet, apiPatch, apiPost, apiPut, IWriteResponse, TacRequestConfig} from "./tdapiinterface";
import {EAssetType} from "./types_AA";

export interface ICreateWatchlistInstrument {
    symbol: string,
    assetType?: EAssetType,
}

export interface ICreateWatchlist {
    name: string,
    watchlistItems: ICreateWatchlistItem[],
}

export interface ICreateWatchlistItem {
    quantity?: number,
    averagePrice?: number,
    commission?: number,
    purchasedDate?: string | Date,
    instrument: ICreateWatchlistInstrument,
}

export enum EWatchlistStatus {
    UNCHANGED,
    CREATED,
    UPDATED,
    DELETED,
}

export interface IWatchlistItem extends ICreateWatchlistItem {
    sequenceId: number,
    instrument: IWatchlistInstrument,
}

export interface IWatchlistInstrument extends ICreateWatchlistInstrument {
    description?: string,
}

export interface IWatchlist {
    name: string,
    watchlistId: string,
    accountId: string,
    status?: EWatchlistStatus,
    watchlistItems: IWatchlistItem[],
}

export interface IWatchlistReplacement {
    name: string,
    watchlistId: string,
    watchlistItems: IWatchlistReplacementItem[],
}

export interface IWatchlistUpdate {
    name: string,
    watchlistId: string,
    watchlistItems: ICreateWatchlistItem[],
}

export interface IWatchlistReplacementItem extends  ICreateWatchlistItem {
    sequenceId: number,
}

export interface ICreateWatchlistConfig extends TacRequestConfig {
    watchlistJSON: ICreateWatchlist,
    accountId: string | number,
}

export interface IDeleteWatchlistConfig extends TacRequestConfig {
    accountId: string | number,
    watchlistId: string,
}

export interface IGetWatchlistConfig extends TacRequestConfig {
    accountId: string | number,
    watchlistId: string,
}

export interface IGetWatchlistsSingleAcctConfig extends TacRequestConfig {
    accountId: string | number,
}

export interface IWatchlistReplaceConfig extends TacRequestConfig {
    watchlistJSON: IWatchlistReplacement,
    accountId: string | number,
    watchlistId: string,
}

export interface IWatchlistPatchConfig extends TacRequestConfig {
    watchlistJSON: IWatchlistUpdate,
    accountId: string | number,
    watchlistId: string,
}


/**
 * Create a new watchlist for a specified accountId using watchlistJSON.
 * The new watchlist id can be parsed from the location property on the return object
 */
export async function createWatchlist(config: ICreateWatchlistConfig): Promise<IWriteResponse> {
    config.bodyJSON = config.watchlistJSON;
    config.path = `/v1/accounts/${config.accountId}/watchlists`;

    return await apiPost(config);
}

/**
 * Delete a single watchlist having watchlistId for a specified accountId.
 * Returns a 204 response on success.
 */
export async function deleteWatchlist(config: IDeleteWatchlistConfig): Promise<any> {
    config.path = `/v1/accounts/${config.accountId}/watchlists/${config.watchlistId}`;

    return await apiDelete(config);
}

/**
 * Get a single watchlist having watchlistId for a specified accountId
 */
export async function getWatchlist(config: IGetWatchlistConfig): Promise<IWatchlist> {
    config.path = `/v1/accounts/${config.accountId}/watchlists/${config.watchlistId}`;

    return await apiGet(config);
}

/**
 * Get all watchlists for all linked accounts
 */
export async function getWatchlistsMultiAcct(config?: TacRequestConfig): Promise<IWatchlist[]> {
    const getConfig = {
        ...config,
        path: `/v1/accounts/watchlists`,
    };

    return await apiGet(getConfig);
}

/**
 * Get all watchlists for a single account with specified accountId
 */
export async function getWatchlistsSingleAcct(config: IGetWatchlistsSingleAcctConfig): Promise<IWatchlist[]> {
    config.path = `/v1/accounts/${config.accountId}/watchlists`;

    return await apiGet(config);
}

/**
 * Replace an entire watchlist having watchlistId for a specified accountId using watchlistJSON
 * Note that sequenceId can not be included in the watchlist item json
 * The location will be returned in the return object but the watchlist id is unchanged
 */
export async function replaceWatchlist(config: IWatchlistReplaceConfig): Promise<IWriteResponse> {
    config.bodyJSON = config.watchlistJSON;
    config.path = `/v1/accounts/${config.accountId}/watchlists/${config.watchlistId}`;

    return await apiPut(config);
}

/**
 * Append/update in place a watchlist having watchlistId for a specified accountId using watchlistJSON
 * The location will be returned in the return object but the watchlist id is unchanged
 */
export async function updateWatchlist(config: IWatchlistPatchConfig): Promise<IWriteResponse> {
    config.bodyJSON = config.watchlistJSON;
    config.path = `/v1/accounts/${config.accountId}/watchlists/${config.watchlistId}`;

    return await apiPatch(config);
}
