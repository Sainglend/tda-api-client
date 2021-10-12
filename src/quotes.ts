// Copyright (C) 2020  Aaron Satterlee

import { Arguments } from "yargs";
import {apiGet} from "./tdapiinterface";

/**
 * Get quotes for a single symbol, e.g. AAPL
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes symbol, apikey (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getQuote(config: any) {
    config.path = `/v1/marketdata/${config.symbol}/quotes` +
        (config.apikey ? `?apikey=${config.apikey}` : '');

    return apiGet(config);
}

/**
 * Get quotes for one or more symbols using a comma-separated string, e.g. F,O,TSLA.
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * @param {Object} config - takes symbol, apikey (optional)
 * @returns {Promise<Object>} api GET result
 * @async
 */
export async function getQuotes(config: any) {
    config.path = `/v1/marketdata/quotes?symbol=${config.symbol}` +
        (config.apikey ? `&apikey=${config.apikey}` : '');

    return apiGet(config);
}

export default {
    command: 'quotes <command>',
    desc: 'Get quotes for one or more symbols',
    builder: (yargs: any) => {
        return yargs
            .command('get <symbols> [apikey]',
                'Get quotes for one or more symbols using a comma-separated string, e.g. F,O,TSLA and may optionally  use your apikey for an unauthenticated delayed request',
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting quotes for ${argv.symbols}`);
                    }
                    return getQuotes({
                        symbol: argv.symbols,
                        apikey: argv.apikey || '',
                        verbose: argv.verbose || false
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
    },
    handler: (argv: Arguments) => {},
};
