// Copyright (C) 2020-1  Aaron Satterlee

import {apiGet} from "./tdapiinterface";

export enum INDEX {
    COMPX = '$COMPX',
    DJI = '$DJI',
    SPX = '$SPX.X',
}

export enum DIRECTION {
    UP = 'up',
    DOWN = 'down',
}

export enum CHANGE {
    PERCENT = 'percent',
    VALUE = 'value',
}

/**
 * Get market movers for a specified major index, Nasdaq Composite, Dow, S&P (use ENUM)
 * a given direction, up or down (use ENUM), and the type of change, value or percent (use ENUM)
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes index (ENUM is INDEX), direction (ENUM is DIRECTION), change (ENUM is CHANGE), apikey (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getMovers(config: any) {
    config.path = `/v1/marketdata/${config.index}/movers` +
        `?direction=${config.direction}` +
        `&change=${config.change}` +
        (config.apikey ? `&apikey=${config.apikey}` : '');

    return apiGet(config);
}
