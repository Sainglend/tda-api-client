// Copyright (C) 2020-1 Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";
import {ICandle} from "./sharedTypes";

/**
 * The type of period by which to group price data (which will be subdivided into candles by FREQUENCY_TYPE)
 * @enum {string}
 */
export enum EPeriodType {
    /** DEFAULT */
    DAY = 'day',
    MONTH = 'month',
    YEAR = 'year',
    YTD = 'ytd',
}

export enum EPeriod {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
    SIX = 6,
    TEN = 10,
    FIFTEEN = 15,
    TWENTY = 20,
}

/**
 * The number of periods to show. Acceptable values depend on, and are enumerated by, PERIOD_TYPE
 * @enum {number}
 */
export const EPERIOD_BY_PERIOD_TYPE = {
    /** Use these values if you selected PERIOD_TYPE.DAY */
    [EPeriodType.DAY]: {
        /** DEFAULT */
        TEN: EPeriod.TEN,
        FIVE: EPeriod.FIVE,
        FOUR: EPeriod.FOUR,
        THREE: EPeriod.THREE,
        TWO: EPeriod.TWO,
        ONE: EPeriod.ONE,
    },
    /** Use these values if you selected PERIOD_TYPE.MONTH */
    [EPeriodType.MONTH]: {
        SIX: EPeriod.SIX,
        THREE: EPeriod.THREE,
        TWO: EPeriod.TWO,
        /** DEFAULT */
        ONE: EPeriod.ONE,
    },
    /** Use these values if you selected PERIOD_TYPE.YEAR */
    [EPeriodType.YEAR]: {
        TWENTY: EPeriod.TWENTY,
        FIFTEEN: EPeriod.FIFTEEN,
        TEN: EPeriod.TEN,
        FIVE: EPeriod.FIVE,
        THREE: EPeriod.THREE,
        TWO: EPeriod.TWO,
        /** DEFAULT */
        ONE: EPeriod.ONE,
    },
    /** Use these values if you selected PERIOD_TYPE.YTD */
    [EPeriodType.YTD]: {
        /** DEFAULT */
        ONE: EPeriod.ONE,
    }

};

export enum EFrequencyType {
    MINUTE = "minute",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
}

/**
 * The type of frequency for the price candles. Valid FREQUENCY_TYPEs depend on, and are enumerated by, PERIOD_TYPE
 * @enum {string}
 */
export const EFREQUENCY_TYPE_BY_PERIOD_TYPE = {
    /** Use these values if you selected PERIOD_TYPE.DAY */
    [EPeriodType.DAY]: {
        /** DEFAULT */
        MINUTE: EFrequencyType.MINUTE,
    },
    /** Use these values if you selected PERIOD_TYPE.MONTH */
    [EPeriodType.MONTH]: {
        /** DEFAULT */
        WEEKLY: EFrequencyType.WEEKLY,
        DAILY: EFrequencyType.DAILY,
    },
    /** Use these values if you selected PERIOD_TYPE.YEAR */
    [EPeriodType.YEAR]: {
        /** DEFAULT */
        MONTHLY: EFrequencyType.MONTHLY,
        WEEKLY: EFrequencyType.WEEKLY,
        DAILY: EFrequencyType.DAILY,
    },
    /** Use these values if you selected PERIOD_TYPE.YTD */
    [EPeriodType.YTD]: {
        /** DEFAULT */
        WEEKLY: EFrequencyType.WEEKLY,
        DAILY: EFrequencyType.DAILY,
    }
};

export enum EFrequency {
    ONE = 1,
    FIVE = 5,
    TEN = 10,
    FIFTEEN = 15,
    THIRTY = 30,
}

/**
 * How many units of the FREQUENCY_TYPE make up a candle. Valid frequencies depend on, and are enumerated by, FREQUENCY_TYPE
 * @enum {number}
 */
export const EFREQUENCY_BY_FREQUENCY_TYPE = {
    /** Use these values if you selected FREQUENCY_TYPE.MINUTE */
    [EFrequencyType.MINUTE]: {
        /** DEFAULT */
        ONE: EFrequency.ONE,
        FIVE: EFrequency.FIVE,
        TEN: EFrequency.TEN,
        FIFTEEN: EFrequency.FIFTEEN,
        THIRTY: EFrequency.THIRTY,
    },
    /** Use this value if you selected FREQUENCY_TYPE.DAILY */
    [EFrequencyType.DAILY]: {
        /** DEFAULT */
        ONE: EFrequency.ONE,
    },
    /** Use these values if you selected FREQUENCY_TYPE.WEEKLY */
    [EFrequencyType.WEEKLY]: {
        /** DEFAULT */
        ONE: EFrequency.ONE,
    },
    /** Use these values if you selected FREQUENCY_TYPE.MONTHLY */
    [EFrequencyType.MONTHLY]: {
        /** DEFAULT */
        ONE: EFrequency.ONE,
    }
};

export interface IPriceHistoryConfig extends TacRequestConfig {
    symbol: string,
    periodType: EPeriodType | string,
    frequencyType: EFrequencyType | string,
    frequency: EFrequency | number,
    getExtendedHours: boolean,
    period?: EPeriod | number,
    startDate?: string,
    endDate?: string,
}

export interface IPriceHistory {
    candles: ICandle[],
    symbol: string,
    empty: boolean,
}

/**
 * Get price history info in the form of candles data for a particular symbol. Provide either start and end dates OR period
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * Takes as input: symbol, PERIOD_TYPE (ENUM is PERIOD_TYPE), period (ENUM is PERIOD), FREQUENCY_TYPE (ENUM is FREQUENCY_TYPE), frequency (ENUM is FREQUENCY),
 * and optionals are: needExtendedHoursData (true [default] or false), startDate (ms since epoch), endDate (ms since epoch), apikey
 */
export async function getPriceHistory(config: IPriceHistoryConfig): Promise<IPriceHistory> {
    config.path = `/v1/marketdata/${config.symbol}/pricehistory?` +
        `periodType=${config.periodType}` +
        `&frequencyType=${config.frequencyType}` +
        `&frequency=${config.frequency}` +
        `&needExtendedHoursData=${config.getExtendedHours}` +
        (config.period ? `&period=${config.period}` : '') +
        (config.startDate ? `&startDate=${config.startDate}` : '') +
        (config.endDate ? `&endDate=${config.endDate}` : '') +
        (config.apikey ? `&apikey=${config.apikey}` : '');

    return await apiGet(config);
}
