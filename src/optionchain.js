// Copyright (C) 2020  Aaron Satterlee

const tdApiInterface = require('./tdapiinterface');

/**
 * Defines what range of strikes to return as results
 * @default ALL
 * @enum {string}
 */
const RANGE = {
    /** DEFAULT */
    ALL: 'ALL',
    /** In-the-money strikes */
    ITM: 'ITM',
    /** Near-the-money strikes */
    NTM: 'NTM',
    /** Out-of-the-money strikes */
    OTM: 'OTM',
    /** Strikes Above Market */
    SAK: 'SAK',
    /** Strikes Below Market */
    SBK: 'SBK',
    /** Strikes Near Market */
    SNK: 'SNK'
};

/**
 * @default SINGLE
 * @enum {string}
 */
const STRATEGY = {
    /** DEFAULT */
    SINGLE: 'SINGLE',
    /** allows use of the volatility, underlyingPrice, interestRate, and daysToExpiration params to calculate theoretical values */
    ANALYTICAL: 'ANALYTICAL',
    COVERED: 'COVERED',
    VERTICAL: 'VERTICAL',
    CALENDAR: 'CALENDAR',
    STRANGLE: 'STRANGLE',
    STRADDLE: 'STRADDLE',
    BUTTERFLY: 'BUTTERFLY',
    CONDOR: 'CONDOR',
    DIAGONAL: 'DIAGONAL',
    COLLAR: 'COLLAR',
    ROLL: 'ROLL'
};

/**
 * @default ALL
 * @enum {string}
 */
const CONTRACT_TYPE = {
    /** DEFAULT */
    ALL: 'ALL',
    CALL: 'CALL',
    PUT: 'PUT'
};

/**
 * @default ALL
 * @enum {string}
 */
const EXPIRATION_MONTH = {
    /** DEFAULT */
    ALL: 'ALL',
    JAN: 'JAN',
    FEB: 'FEB',
    MAR: 'MAR',
    APR: 'APR',
    MAY: 'MAY',
    JUN: 'JUN',
    JUL: 'JUL',
    AUG: 'AUG',
    SEP: 'SEP',
    OCT: 'OCT',
    NOV: 'NOV',
    DEC: 'DEC'
};

/**
 * @default ALL
 * @enum {string}
 */
const OPTION_TYPE = {
    /** DEFAULT */
    ALL: 'ALL',
    /** Standard contracts */
    STANDARD: 'S',
    /** Non-standard contracts */
    NONSTANDARD: 'NS'
};

/**
 * Get an options chain for a given symbol. Carefully use config options.
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes symbol, contractType (ENUM is CONTRACT_TYPE), expMonth (ENUM is EXPIRATION_MONTH), optionType (ENUM is OPTION_TYPE), strategy (ENUM is STRATEGY), range (ENUM is RANGE), includeQuotes, and optionals are:
 * fromDate (yyyy-MM-dd), toDate (yyyy-MM-dd), strikeCount, interval, volatility, underlyingPrice, interestRate, daysToExpiration, apikey
 * @returns {Promise<Object>} api GET result
 * @async
 */
const getOptionChain = async (config) => {
    config.path =  `/v1/marketdata/chains?` +
        `symbol=${config.symbol}` +
        `&contractType=${config.contractType}` +
        `&expMonth=${config.expMonth}` +
        `&optionType=${config.optionType}` +
        `&strategy=${config.strategy}` +
        `&range=${config.range}` +
        `&includeQuotes=${config.includeQuotes}` +
        (config.fromDate ? `&fromDate=${config.fromDate}` : '') +
        (config.toDate ? `&toDate=${config.toDate}` : '') +
        (config.strikeCount ? `&strikeCount=${config.strikeCount}` : '') +
        (config.interval ? `&interval=${config.interval}` : '') +
        (config.volatility ? `&volatility=${config.volatility}` : '') +
        (config.underlyingPrice ? `&underlyingPrice=${config.underlyingPrice}` : '') +
        (config.interestRate ? `&interestRate=${config.interestRate}` : '') +
        (config.daysToExpiration ? `&daysToExpiration=${config.daysToExpiration}` : '') +
        (config.apikey ? `&apikey=${config.apikey}` : '');

    return tdApiInterface.apiGet(config);
};

exports.api = {
    getOptionChain,
    CONTRACT_TYPE,
    EXPIRATION_MONTH,
    OPTION_TYPE,
    RANGE,
    STRATEGY
};
exports.command = 'options <command>';
exports.desc = 'Get option chain info';
exports.builder = (yargs) => {
  return yargs
    .command('chain <symbol>',
        `Get option chain for a given <symbol>. Use command's options liberally (see detail by issuing command "cli_options.js options chain")`,
        {
            apikey: {
                alias: 'a',
                type: 'string',
                desc: 'Your OAuth User ID to make an unauthenticated request for delayed data, e.g. ABC@AMER.OAUTHAP'
            },
            from: {
                alias: 'f',
                type: 'string',
                desc: 'Option expiration after this date, e.g. 2020-11-22'
            },
            to: {
                alias: 't',
                type: 'string',
                desc: 'Option expriation before this date, e.g. 2020-11-29'
            },
            includeQuotes: {
                alias: 'q',
                type: 'string',
                desc: 'Include quotes for options in the option chain. Can be TRUE or FALSE. Default is FALSE.',
                default: 'FALSE',
                choices: ['FALSE', 'TRUE']
            },
            contractType: {
                alias: 'c',
                type: 'string',
                desc: 'Type of contracts to return in the chain. Can be CALL, PUT, or ALL. Default is ALL.',
                default: 'ALL',
                choices: Object.keys(OPTION_TYPE)
            },
            strikeCount: {
                alias: 'n',
                type: 'number',
                desc: 'The number of strikes to return above and below the at-the-money price.'
            },
            strategy: {
                alias: 's',
                type: 'string',
                desc: 'Passing a value returns a Strategy Chain. Possible values are SINGLE, ANALYTICAL (allows use of the volatility, underlyingPrice, interestRate, and daysToExpiration params to calculate theoretical values), COVERED, VERTICAL, CALENDAR, STRANGLE, STRADDLE, BUTTERFLY, CONDOR, DIAGONAL, COLLAR, or ROLL. Default is SINGLE.',
                default: 'SINGLE',
                choices: Object.keys(STRATEGY)
            },
            interval: {
                alias: 'i',
                type: 'number',
                desc: 'Strike interval for spread strategy chains (see strategy option), i.e. width of spread'
            },
            strike: {
                alias: 'k',
                type: 'number',
                desc: 'Provide a strike price to return options only at that strike price.'
            },
            range: {
                alias: 'r',
                type: 'string',
                desc: 'Returns options for the given range, e.g. ITM, OTM, NTM',
                default: 'ALL',
                choices: Object.keys(RANGE)
            },
            expMonth: {
                alias: 'm',
                type: 'string',
                desc: 'Return only options expiring in the specified month',
                default: 'ALL',
                choices: Object.keys(EXPIRATION_MONTH)
            },
            optionType: {
                alias: 'type',
                type: 'string',
                desc: 'Type of contracts to return, standard, non-standard, or all',
                default: 'ALL',
                choices: Object.keys(OPTION_TYPE)
            },
            volatility: {
                alias: ['v', 'vol'],
                type: 'number',
                desc: 'Volatility (IV, or implied volatility) to use in calculations, e.g. 29. Applies only to ANALYTICAL strategy chains (see strategy param).'
            },
            underlyingPrice: {
                alias: ['u', 'under'],
                type: 'number',
                desc: 'Underlying price to use in calculations, e.g. 34.44. Applies only to ANALYTICAL strategy chains (see strategy param).'
            },
            interestRate: {
                alias: ['int'],
                type: 'number',
                desc: 'Interest rate to use in calculations, e.g. 0.1. Applies only to ANALYTICAL strategy chains (see strategy param).'
            },
            daysToExpiration: {
                alias: ['dte'],
                type: 'number',
                desc: 'Days to expiration to use in calculations. Applies only to ANALYTICAL strategy chains (see strategy param).'
            }
        },
        async (argv) => {
            if (argv.verbose) {
                console.log(`getting option chain for ${argv.symbol}`);
            }
            return getOptionChain({
                symbol: argv.symbol,
                contractType: argv.contractType, // has default
                expMonth: argv.expMonth, // has default
                optionType: argv.optionType, // has default
                strategy: argv.strategy, // has default
                range: argv.range, // has default
                includeQuotes: argv.includeQuotes, // has default
                apikey: argv.apikey || '',
                fromDate: argv.from || '',
                toDate: argv.to || '',
                strikeCount: argv.strikeCount || '',
                interval: argv.interval || '',
                volatility: argv.volatility || '',
                underlyingPrice: argv.underlyingPrice || '',
                interestRate: argv.interestRate || '',
                daysToExpiration: argv.daysToExpiration || '',
                verbose: argv.verbose || false
            }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        });
};
exports.handler = (argv) => {};
