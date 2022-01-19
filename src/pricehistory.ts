// Copyright (C) 2020-2 Aaron Satterlee

import {apiGet, TacRequestConfig} from "./tdapiinterface";
import {ICandle} from "./sharedTypes";

/**
 * The type of period by which to group price data (which will be subdivided into candles by {@link EFrequencyType)}
 */
export enum EPeriodType {
    /** DEFAULT */
    DAY = "day",
    MONTH = "month",
    YEAR = "year",
    YTD = "ytd",
}

/**
 * This pairs with {@link EPeriodType}. Use {@link EPeriodQtyByPeriodType} to get valid quantities for the given type.
 */
export enum EPeriodQty {
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
 * The number of periods to show. Acceptable values are members of {@link EPeriodQty} and depend on, and are enumerated by, {@link EPeriodType}
 * @example
 * EPeriodQtyByPeriodType[EPeriodType.DAY].FIVE
 */
export const EPeriodQtyByPeriodType = {
    /** Use these values if you selected EPeriodType.DAY */
    [EPeriodType.DAY]: {
        /** DEFAULT */
        TEN: EPeriodQty.TEN,
        FIVE: EPeriodQty.FIVE,
        FOUR: EPeriodQty.FOUR,
        THREE: EPeriodQty.THREE,
        TWO: EPeriodQty.TWO,
        ONE: EPeriodQty.ONE,
    },
    /** Use these values if you selected EPeriodType.MONTH */
    [EPeriodType.MONTH]: {
        SIX: EPeriodQty.SIX,
        THREE: EPeriodQty.THREE,
        TWO: EPeriodQty.TWO,
        /** DEFAULT */
        ONE: EPeriodQty.ONE,
    },
    /** Use these values if you selected EPeriodType.YEAR */
    [EPeriodType.YEAR]: {
        TWENTY: EPeriodQty.TWENTY,
        FIFTEEN: EPeriodQty.FIFTEEN,
        TEN: EPeriodQty.TEN,
        FIVE: EPeriodQty.FIVE,
        THREE: EPeriodQty.THREE,
        TWO: EPeriodQty.TWO,
        /** DEFAULT */
        ONE: EPeriodQty.ONE,
    },
    /** Use these values if you selected EPeriodType.YTD */
    [EPeriodType.YTD]: {
        /** DEFAULT */
        ONE: EPeriodQty.ONE,
    },

};

/**
 * Each candle represents this time unit, quantity specified with {@link EFrequencyQty}
 */
export enum EFrequencyType {
    MINUTE = "minute",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
}

/**
 * The frequency type (time unit) for the price candles. Valid {@link EFrequencyType} values
 * for your chosen period type (time span for the whole chart) depend on, and are enumerated by, {@link EPeriodType}
 * @example
 * EFrequencyTypeByPeriodType[EPeriodType.DAY].MINUTE
 */
export const EFrequencyTypeByPeriodType = {
    /** Use these values if you selected EPeriodType.DAY */
    [EPeriodType.DAY]: {
        /** DEFAULT */
        MINUTE: EFrequencyType.MINUTE,
    },
    /** Use these values if you selected EPeriodType.MONTH */
    [EPeriodType.MONTH]: {
        /** DEFAULT */
        WEEKLY: EFrequencyType.WEEKLY,
        DAILY: EFrequencyType.DAILY,
    },
    /** Use these values if you selected EPeriodType.YEAR */
    [EPeriodType.YEAR]: {
        /** DEFAULT */
        MONTHLY: EFrequencyType.MONTHLY,
        WEEKLY: EFrequencyType.WEEKLY,
        DAILY: EFrequencyType.DAILY,
    },
    /** Use these values if you selected EPeriodType.YTD */
    [EPeriodType.YTD]: {
        /** DEFAULT */
        WEEKLY: EFrequencyType.WEEKLY,
        DAILY: EFrequencyType.DAILY,
    },
};

/**
 * Each candle represents this many time units, specified in {@link EFrequencyType}
 */
export enum EFrequencyQty {
    ONE = 1,
    FIVE = 5,
    TEN = 10,
    FIFTEEN = 15,
    THIRTY = 30,
}

/**
 * How many units of the EFrequencyType time units make up a candle. Valid quantities/frequencies come from {@link EFrequencyQty}
 * and depend on, and are enumerated by, {@link EFrequencyType}
 * @example
 * EFrequencyQtyByFrequencyType[EFrequencyType.MINUTE].FIFTEEN
 */
export const EFrequencyQtyByFrequencyType = {
    /** Use these values if you selected EFrequencyType.MINUTE */
    [EFrequencyType.MINUTE]: {
        /** DEFAULT */
        ONE: EFrequencyQty.ONE,
        FIVE: EFrequencyQty.FIVE,
        TEN: EFrequencyQty.TEN,
        FIFTEEN: EFrequencyQty.FIFTEEN,
        THIRTY: EFrequencyQty.THIRTY,
    },
    /** Use this value if you selected EFrequencyType.DAILY */
    [EFrequencyType.DAILY]: {
        /** DEFAULT */
        ONE: EFrequencyQty.ONE,
    },
    /** Use these values if you selected EFrequencyType.WEEKLY */
    [EFrequencyType.WEEKLY]: {
        /** DEFAULT */
        ONE: EFrequencyQty.ONE,
    },
    /** Use these values if you selected EFrequencyType.MONTHLY */
    [EFrequencyType.MONTHLY]: {
        /** DEFAULT */
        ONE: EFrequencyQty.ONE,
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
     * Can use {@link EFrequencyQtyByFrequencyType} to get appropriate values to use
     */
    frequency: EFrequencyQty | number,
    // optional
    getExtendedHours?: boolean,
    /**
     * Can use {@link EPeriodQtyByPeriodType} to get appropriate values to use.
     * Provide either this or startDate and endDate
     */
    period?: EPeriodQty | number,
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
