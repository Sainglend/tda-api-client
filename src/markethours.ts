// Copyright (C) 2020  Aaron Satterlee

import { Arguments } from "yargs";
import {apiGet} from "./tdapiinterface";

export enum MARKETS {
    EQUITY = 'EQUITY',
    OPTION = 'OPTION',
    FUTURE = 'FUTURE',
    BOND = 'BOND',
    FOREX = 'FOREX'
}

/**
 * Get market open hours for a specified date (e.g. 2020-09-18) and a specified market (use ENUM).
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes market (ENUM is MARKETS), date, apikey (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getSingleMarketHours(config: any) {
    config.path = `/v1/marketdata/${config.market}/hours?date=${config.date}` +
        (config.apikey ? `&apikey=${config.apikey}` : '');

    return apiGet(config);
}

/**
 * Get market open hours for a specified date (e.g. 2020-09-18) and a comma-separated set of markets from EQUITY, OPTION, FUTURE, BOND, or FOREX, e.g. "EQUITY,OPTION".
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes markets, date, apikey (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getMultipleMarketHours(config: any) {
    config.path = `/v1/marketdata/hours?markets=${config.markets}&date=${config.date}` +
        (config.apikey ? `&apikey=${config.apikey}` : '');

    return apiGet(config);
}

export default {
    command: 'hours <command>',
    desc: 'Get market hours',
    builder: (yargs: any) => {
        return yargs
            .command('get <date> <markets> [apikey]',
                'Get market open hours for a specified date <date> (e.g. 2020-09-18) and a comma-separated set of <markets> from EQUITY, OPTION, FUTURE, BOND, or FOREX, e.g. "EQUITY,OPTION". Including your optional <apikey> makes an unauthenticated request.',
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting market hours for ${argv.date} for markets ${argv.markets}`);
                    }
                    return getMultipleMarketHours({
                        markets: argv.markets,
                        date: argv.date,
                        apikey: argv.apikey,
                        verbose: argv.verbose || false
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command('getone <date> <market> [apikey]',
                'Get market open hours for a specified date <date> and a single <market> from EQUITY, OPTION, FUTURE, BOND, or FOREX. Including your optional <apikey> makes an unauthenticated request.',
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting market hours for ${argv.date} for market ${argv.market}`);
                    }
                    return getSingleMarketHours({
                        market: argv.market,
                        date: argv.date,
                        apikey: argv.apikey,
                        verbose: argv.verbose || false
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });
    },
    handler: (argv: any) => {},
};
