// Copyright (C) 2020-1 Aaron Satterlee

import {apiGet} from "./tdapiinterface";

/**
 * The type of period by which to group price data (which will be subdivided into candles by FREQUENCY_TYPE)
 * @enum {string}
 */
export enum PERIOD_TYPE {
    /** DEFAULT */
    DAY = 'day',
    MONTH = 'month',
    YEAR = 'year',
    YTD = 'ytd',
}

/**
 * The number of periods to show. Acceptable values depend on, and are enumerated by, PERIOD_TYPE
 * @enum {number}
 */
export const PERIOD = {
    /** Use these values if you selected PERIOD_TYPE.DAY */
    DAY: {
        /** DEFAULT */
        10: 10,
        5: 5,
        4: 4,
        3: 3,
        2: 2,
        1: 1
    },
    /** Use these values if you selected PERIOD_TYPE.MONTH */
    MONTH: {
        6: 6,
        3: 3,
        2: 2,
        /** DEFAULT */
        1: 1
    },
    /** Use these values if you selected PERIOD_TYPE.YEAR */
    YEAR: {
        20: 20,
        15: 15,
        10: 10,
        5: 5,
        3: 3,
        2: 2,
        /** DEFAULT */
        1: 1
    },
    /** Use these values if you selected PERIOD_TYPE.YTD */
    YTD: {
        /** DEFAULT */
        1: 1
    }

};

/**
 * The type of frequency for the price candles. Valid FREQUENCY_TYPEs depend on, and are enumerated by, PERIOD_TYPE
 * @enum {string}
 */
export const FREQUENCY_TYPE = {
    /** Use these values if you selected PERIOD_TYPE.DAY */
    DAY: {
        /** DEFAULT */
        MINUTE: 'minute'
    },
    /** Use these values if you selected PERIOD_TYPE.MONTH */
    MONTH: {
        /** DEFAULT */
        WEEKLY: 'weekly',
        DAILY: 'daily'
    },
    /** Use these values if you selected PERIOD_TYPE.YEAR */
    YEAR: {
        /** DEFAULT */
        MONTHLY: 'monthly',
        WEEKLY: 'weekly',
        DAILY: 'daily'
    },
    /** Use these values if you selected PERIOD_TYPE.YTD */
    YTD: {
        /** DEFAULT */
        WEEKLY: 'weekly',
        DAILY: 'daily'
    }
};

/**
 * How many units of the FREQUENCY_TYPE make up a candle. Valid frequencies depend on, and are enumerated by, FREQUENCY_TYPE
 * @enum {number}
 */
export const FREQUENCY = {
    /** Use these values if you selected FREQUENCY_TYPE.MINUTE */
    MINUTE: {
        /** DEFAULT */
        ONE: 1,
        FIVE: 5,
        TEN: 10,
        FIFTEEN: 15,
        THIRTY: 30
    },
    /** Use this value if you selected FREQUENCY_TYPE.DAILY */
    DAILY: {
        /** DEFAULT */
        ONE: 1
    },
    /** Use these values if you selected FREQUENCY_TYPE.WEEKLY */
    WEEKLY: {
        /** DEFAULT */
        ONE: 1
    },
    /** Use these values if you selected FREQUENCY_TYPE.MONTHLY */
    MONTHLY: {
        /** DEFAULT */
        ONE: 1
    }
};

/**
 * Get price history info in the form of candles data for a particular symbol. Provide either start and end dates OR period
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes symbol, PERIOD_TYPE (ENUM is PERIOD_TYPE), period (ENUM is PERIOD), FREQUENCY_TYPE (ENUM is FREQUENCY_TYPE), frequency (ENUM is FREQUENCY),
 * and optionals are: needExtendedHoursData (true [default] or false), startDate (ms since epoch), endDate (ms since epoch), apikey
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getPriceHistory(config: any) {
    config.path = `/v1/marketdata/${config.symbol}/pricehistory?` +
        `periodType=${config.periodType || config.PERIOD_TYPE}` +
        `&frequencyType=${config.frequencyType || config.FREQUENCY_TYPE}` +
        `&frequency=${config.frequency}` +
        `&needExtendedHoursData=${config.getExtendedHours}` +
        (config.period ? `&period=${config.period}` : '') +
        (config.startDate ? `&startDate=${config.startDate}` : '') +
        (config.endDate ? `&endDate=${config.endDate}` : '') +
        (config.apikey ? `&apikey=${config.apikey}` : '');

    return apiGet(config);
}
