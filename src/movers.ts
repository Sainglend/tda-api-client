// Copyright (C) 2020-1  Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";

export enum INDEX {
    COMPX = "$COMPX",
    DJI = "$DJI",
    SPX = "$SPX.X",
}

export enum DIRECTION {
    UP = "up",
    DOWN = "down",
}

export enum CHANGE {
    PERCENT = "percent",
    VALUE = "value",
}

export interface IGetMoversConfig extends TacRequestConfig {
    index: INDEX,
    direction: DIRECTION,
    change: CHANGE,
}

export interface IMover {
    change: number,
    description: string,
    direction: DIRECTION,
    last: number,
    symbol: string,
    totalVolume: number,
}

/**
 * Get market movers for a specified major index, Nasdaq Composite, Dow, S&P (use ENUM)
 * a given direction, up or down (use ENUM), and the type of change, value or percent (use ENUM)
 * Can optionally use apikey for delayed data with an unauthenticated request.
 */
export async function getMovers(config: IGetMoversConfig): Promise<IMover[]> {
    config.path = `/v1/marketdata/${config.index}/movers` +
        `?direction=${config.direction}` +
        `&change=${config.change}` +
        (config.apikey ? `&apikey=${config.apikey}` : "");
    return await apiGet(config);
}
