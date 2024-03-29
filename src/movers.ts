// Copyright (C) 2020-2  Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";

export enum EIndex {
    COMPX = "$COMPX",
    DJI = "$DJI",
    SPX = "$SPX.X",
}

export enum EDirection {
    UP = "up",
    DOWN = "down",
}

export enum EChange {
    PERCENT = "percent",
    VALUE = "value",
}

export interface IGetMoversConfig extends TacRequestConfig {
    index: EIndex | string,
    direction: EDirection | string,
    change: EChange | string,
}

export interface IMover {
    change: number,
    description: string,
    direction: EDirection | string,
    last: number,
    symbol: string,
    totalVolume: number,
}

/**
 * Get market movers for a specified major index, Nasdaq Composite, Dow, S&P (use enum EIndex)
 * a given direction, up or down (use enum EDirection), and the type of change, value or percent (use enum EChange)
 * Can optionally use apikey for delayed data with an unauthenticated request.
 */
export async function getMovers(config: IGetMoversConfig): Promise<IMover[]> {
    config.path = `/v1/marketdata/${config.index}/movers` +
        `?direction=${config.direction}` +
        `&change=${config.change}` +
        (config.apikey ? `&apikey=${config.apikey}` : "");
    return await apiGet(config);
}
