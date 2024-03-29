// Copyright (C) 2020-2  Aaron Satterlee

import {Arguments} from "yargs";
import {getMultipleMarketHours, getSingleMarketHours} from "../markethours";

export default {
    command: "hours <command>",
    desc: "Get market hours",
    builder: (yargs: any): any => {
        return yargs
            .command("get <date> <markets> [apikey]",
                "Get market open hours for a specified date <date> (e.g. 2020-09-18) and a comma-separated set of <markets> from EQUITY, OPTION, FUTURE, BOND, or FOREX, e.g. \"EQUITY,OPTION\". Including your optional <apikey> makes an unauthenticated request.",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting market hours for ${argv.date} for markets ${argv.markets}`);
                    }
                    return getMultipleMarketHours({
                        markets: argv.markets as string,
                        date: argv.date as string,
                        apikey: argv.apikey as string,
                        verbose: String(argv.verbose) === "true",
                        path: "",
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("getone <date> <market> [apikey]",
                "Get market open hours for a specified date <date> and a single <market> from EQUITY, OPTION, FUTURE, BOND, or FOREX. Including your optional <apikey> makes an unauthenticated request.",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting market hours for ${argv.date} for market ${argv.market}`);
                    }
                    return getSingleMarketHours({
                        market: argv.market as string,
                        date: argv.date as string,
                        apikey: argv.apikey as string,
                        verbose: String(argv.verbose) === "true",
                        path: "",
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });
    },
    handler: (argv: Arguments): void => { /* no op */ },
};
