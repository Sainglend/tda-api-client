// Copyright (C) 2020-2 Aaron Satterlee

import {apiDelete, apiGet, apiPost, apiPut, IWriteResponse, TacRequestConfig} from "./tdapiinterface";
import {IOrderGet} from "./orders";

export interface ICreateSavedOrderConfig extends TacRequestConfig {
    accountId: string | number,
    orderJSON: any,
}

export interface IReplaceSaveOrderConfig extends TacRequestConfig {
    accountId: string | number,
    savedOrderId: string,
    orderJSON: any,
}

export interface ISimpleSavedOrderConfig extends TacRequestConfig {
    accountId: string | number,
    savedOrderId: string,
}

export interface IGetSavedOrdersConfig extends TacRequestConfig {
    accountId: string | number,
}

/**
 * Create a saved order for a given account
 * The id is part of the uri in the location property of the return object
 * See order examples at: https://developer.tdameritrade.com/content/place-order-samples
 * Not rate limited so never queued unless specifically overridden.
 */
export async function createSavedOrder(config: ICreateSavedOrderConfig): Promise<IWriteResponse> {
    config.bodyJSON = config.orderJSON;
    config.path = `/v1/accounts/${config.accountId}/savedorders`;

    return await apiPost({ queueSettings: { enqueue: false }, ...config });
}

/**
 * Delete a specified saved order for a given account
 * Just an acknowledgement response code is returned.
 * Not rate limited so never queued unless specifically overridden.
 */
export async function deleteSavedOrder(config: ISimpleSavedOrderConfig): Promise<any> {
    config.path = `/v1/accounts/${config.accountId}/savedorders/${config.savedOrderId}`;
    return await apiDelete({ queueSettings: { enqueue: false }, ...config });
}

/**
 * Get a particular saved order for a given account
 * Not rate limited so never queued unless specifically overridden.
 */
export async function getSavedOrderById(config: ISimpleSavedOrderConfig): Promise<IOrderGet> {
    config.path = `/v1/accounts/${config.accountId}/savedorders/${config.savedOrderId}`;
    return await apiGet({ queueSettings: { enqueue: false }, ...config });
}

/**
 * Get all saved orders for a given account
 * Not rate limited so never queued unless specifically overridden.
 */
export async function getSavedOrders(config: IGetSavedOrdersConfig): Promise<IOrderGet[]> {
    config.path = `/v1/accounts/${config.accountId}/savedorders`;
    return await apiGet({ queueSettings: { enqueue: false }, ...config });
}

/**
 * Replace an existing saved order for a specified account using the properly formatted orderJSON
 * The saved order id will be part of the location uri in the returned object
 * See order examples at: https://developer.tdameritrade.com/content/place-order-samples
 * Not rate limited so never queued unless specifically overridden.
 */
export async function replaceSavedOrder(config: IReplaceSaveOrderConfig): Promise<IWriteResponse> {
    config.bodyJSON = config.orderJSON;
    config.path = `/v1/accounts/${config.accountId}/savedorders/${config.savedOrderId}`;
    return await apiPut({ queueSettings: { enqueue: false }, ...config });
}
