// Copyright (C) 2020  Aaron Satterlee

const tdApiInterface = require('./tdapiinterface');

/**
 * The type of period by which to group price data (which will be subdivided into candles by FREQUENCY_TYPE)
 * @enum {string}
 */
const PERIOD_TYPE = {
    /** DEFAULT */
    DAY: 'day',
    MONTH: 'month',
    YEAR: 'year',
    YTD: 'ytd'
};

/**
 * The number of periods to show. Acceptable values depend on, and are enumerated by, PERIOD_TYPE
 * @enum {number}
 */
const PERIOD = {
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
const FREQUENCY_TYPE = {
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
const FREQUENCY = {
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
 * and optionals are: needExtendedHoursData (true [default] or false), startDate, endDate, apikey
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getPriceHistory = async (config) => {
    config.path = `/v1/marketdata/${config.symbol}/pricehistory?` +
        `PERIOD_TYPE=${config.PERIOD_TYPE}` +
        `&FREQUENCY_TYPE=${config.FREQUENCY_TYPE}` +
        `&frequency=${config.frequency}` +
        `&needExtendedHoursData=${config.getExtendedHours}` +
        (config.period ? `&period=${config.period}` : '') +
        (config.startDate ? `&startDate=${config.startDate}` : '') +
        (config.endDate ? `&endDate=${config.endDate}` : '') +
        (config.apikey ? `&apikey=${config.apikey}` : '');

    return tdApiInterface.apiGet(config);
};

exports.api = {
    getPriceHistory,
    PERIOD_TYPE,
    PERIOD,
    FREQUENCY_TYPE,
    FREQUENCY
};
exports.command = 'pricehistory <command>';
exports.desc = 'Get price history info in the form of candles data';
exports.builder = (yargs) => {
  return yargs
    .command('get <symbol>',
        'Get price history info in the form of candles data for a particular <symbol>',
        {
            apikey: {
                alias: 'a',
                type: 'string',
                desc: 'Your OAuth User ID to make an unauthenticated request for delayed data, e.g. ABC@AMER.OAUTHAP'
            },
            from: {
                alias: 'f',
                type: 'string',
                desc: 'Start date as milliseconds since epoch. If startDate and endDate are provided, period should not be provided.'
            },
            to: {
                alias: 't',
                type: 'string',
                desc: 'End date as milliseconds since epoch. If startDate and endDate are provided, period should not be provided. Default is previous trading day.'
            },
            needExtendedHoursData: {
                alias: 'x',
                type: 'string',
                desc: 'Include price data from market extended hours (pre 9:30A and post 4P Eastern)',
                default: 'true',
                choices: ['false', 'true']
            },
            periodtype: {
                alias: 'p',
                type: 'string',
                desc: 'The type of period by which to group price data (which will be subdivided into candles by FREQUENCY_TYPE)',
                default: 'day',
                choices: ['day', 'month', 'year', 'ytd']
            },
            period: {
                alias: 'd',
                type: 'number',
                desc: '(Use period OR from and to dates) The number of periods to show. Acceptable values based on PERIOD_TYPE, defaults marked with asterisk. day (1,2,3,4,5,10*), month(1*,2,3,6), year (1*,2,3,5,10,15,20), ytd (1*)',
                choices: [1, 2, 3, 4, 5, 6, 10, 15, 20]
            },
            frequencytype: {
                alias: 'c',
                type: 'string',
                desc: 'The type of frequency for the price candles. Valid FREQUENCY_TYPEs by PERIOD_TYPE (defaults are *): day (minute*), month (daily, weekly*), year (daily, weekly, monthly*), ytd (daily, weekly*)',
                choices: ['minute', 'daily', 'weekly', 'monthly']
            },
            frequency: {
                alias: 'q',
                type: 'number',
                desc: 'How many units of the FREQUENCY_TYPE make up a candle. Valid frequencies by FREQUENCY_TYPE are (default are *): minute (1*,5,10,15,30), daily (1*), weekly (1*), monthly (1*)',
                default: 1,
                choices: [1, 5, 10, 15, 30]
            }
        },
        async (argv) => {
            if (argv.verbose) {
                console.log(`getting price history for ${argv.symbol}`);
            }

            return getPriceHistory({
                symbol: argv.symbol,
                PERIOD_TYPE: argv.PERIOD_TYPE,
                period: argv.period || (argv.from ? '' : (argv.PERIOD_TYPE === 'day' ? 10 : 1)),
                FREQUENCY_TYPE: argv.FREQUENCY_TYPE || '',
                frequency: argv.frequency,
                startDate: argv.from || '',
                endDate: argv.to || '',
                getExtendedHours: argv.needExtendedHoursData,
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        });
};
exports.handler = (argv) => {};
