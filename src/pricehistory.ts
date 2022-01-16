// Copyright (C) 2020-2 Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";
import {ICandle} from "./sharedTypes";

/**
 * The type of period by which to group price data (which will be subdivided into candles by FREQUENCY_TYPE)
 * @enum {string}
 */
export enum EPeriodType {
    /** DEFAULT */
    DAY = "day",
    MONTH = "month",
    YEAR = "year",
    YTD = "ytd",
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
export const EPeriodByPeriodType = {
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
    },

};

export enum EFrequencyType {
    MINUTE = "minute",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
}

/**
 * The frquency type for the price candles. Valid {@link EFrequencyType} values
 * for your chosen period type depend on, and are enumerated by, {@link EPeriodType}
 * @example
 * EFrequencyTypeByPeriodType[EPeriodType.DAY].MINUTE
 */
export const EFrequencyTypeByPeriodType = {
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
    },
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
export const EFrequencyByFrequencyType = {
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
    },
};

/**
 * startDate and endDate are ms since epoch
 * Provide either period OR (startDate and endDate)
 */
export interface IPriceHistoryConfig extends TacRequestConfig {
    symbol: string,
    // Over what period of time you would like the data. Use period or startDate/endDate to specify time span
    periodType: EPeriodType | string,
    /**
     * Can use {@link EFrequencyTypeByPeriodType} to get appropriate values to use
     */
    frequencyType: EFrequencyType | string,
    /**
     * Can use {@link EFrequencyByFrequencyType} to get appropriate values to use
     */
    frequency: EFrequency | number,
    // optional
    getExtendedHours?: boolean,
    /**
     * Can use {@link EPeriodByPeriodType} to get appropriate values to use.
     * Provide either this or startDate and endDate
     */
    period?: EPeriod | number,
    // ms since epoch. Use this and endDate OR supply period.
    startDate?: number,
    // ms since epoch. Use this and startDate OR supply period.
    endDate?: number,
}

export interface IPriceHistory {
    candles: ICandle[],
    symbol: string,
    empty: boolean,
}

/**
 * Get price history info in the form of {@link ICandle} candle data for a particular symbol.
 * Provide either startDate and endDate OR period in {@link IPriceHistoryConfig} input.
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * See also {@link IPriceHistoryConfig} for details on input.
 */
export async function getPriceHistory(config: IPriceHistoryConfig): Promise<IPriceHistory> {
    config.path = `/v1/marketdata/${config.symbol}/pricehistory?` +
        `periodType=${config.periodType}` +
        `&frequencyType=${config.frequencyType}` +
        `&frequency=${config.frequency}` +
        (config.getExtendedHours != null ? `&needExtendedHoursData=${config.getExtendedHours}` : "") +
        (config.period ? `&period=${config.period}` : "") +
        (config.startDate ? `&startDate=${config.startDate}` : "") +
        (config.endDate ? `&endDate=${config.endDate}` : "") +
        (config.apikey ? `&apikey=${config.apikey}` : "");

    return await apiGet(config);
}
