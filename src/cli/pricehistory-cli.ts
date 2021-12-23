// Copyright (C) 2020-1 Aaron Satterlee

import {Arguments} from "yargs";
import {getPriceHistory} from "../pricehistory";

export default {
    command: "pricehistory <command>",
    desc: "Get price history info in the form of candles data",
    builder: (yargs: any): any => {
        return yargs
            .command("get <symbol>",
                "Get price history info in the form of candles data for a particular <symbol>",
                {
                    apikey: {
                        alias: "a",
                        type: "string",
                        desc: "Your OAuth User ID to make an unauthenticated request for delayed data, e.g. ABC@AMER.OAUTHAP",
                    },
                    from: {
                        alias: "f",
                        type: "string",
                        desc: "Start date as milliseconds since epoch. If startDate and endDate are provided, period should not be provided.",
                    },
                    to: {
                        alias: "t",
                        type: "string",
                        desc: "End date as milliseconds since epoch. If startDate and endDate are provided, period should not be provided. Default is previous trading day.",
                    },
                    needExtendedHoursData: {
                        alias: "x",
                        type: "string",
                        desc: "Include price data from market extended hours (pre 9:30A and post 4P Eastern)",
                        default: "true",
                        choices: ["false", "true"],
                    },
                    periodtype: {
                        alias: "p",
                        type: "string",
                        desc: "The type of period by which to group price data (which will be subdivided into candles by FREQUENCY_TYPE)",
                        default: "day",
                        choices: ["day", "month", "year", "ytd"],
                    },
                    period: {
                        alias: "d",
                        type: "number",
                        desc: "(Use period OR from and to dates) The number of periods to show. Acceptable values based on PERIOD_TYPE, defaults marked with asterisk. day (1,2,3,4,5,10*), month(1*,2,3,6), year (1*,2,3,5,10,15,20), ytd (1*)",
                        choices: [1, 2, 3, 4, 5, 6, 10, 15, 20],
                    },
                    frequencytype: {
                        alias: "c",
                        type: "string",
                        desc: "The type of frequency for the price candles. Valid FREQUENCY_TYPEs by PERIOD_TYPE (defaults are *): day (minute*), month (daily, weekly*), year (daily, weekly, monthly*), ytd (daily, weekly*)",
                        choices: ["minute", "daily", "weekly", "monthly"],
                    },
                    frequency: {
                        alias: "q",
                        type: "number",
                        desc: "How many units of the FREQUENCY_TYPE make up a candle. Valid frequencies by FREQUENCY_TYPE are (default are *): minute (1*,5,10,15,30), daily (1*), weekly (1*), monthly (1*)",
                        default: 1,
                        choices: [1, 5, 10, 15, 30],
                    },
                },
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting price history for ${argv.symbol}`);
                    }

                    return getPriceHistory({
                        symbol: argv.symbol as string,
                        periodType: argv.PERIOD_TYPE ? String(argv.PERIOD_TYPE) : "",
                        period: argv.period ? Number(argv.period) : (argv.from ? undefined : (argv.PERIOD_TYPE === "day" ? 10 : 1)),
                        frequencyType: argv.FREQUENCY_TYPE ? String(argv.FREQUENCY_TYPE) : "",
                        frequency: parseInt(argv.frequency as string),
                        startDate: argv.from ? String(argv.from) : undefined,
                        endDate: argv.to ? String(argv.to) : undefined,
                        getExtendedHours: String(argv.needExtendedHoursData) === "true",
                        verbose: String(argv.verbose) === "true",
                        apikey: argv.apikey ? String(argv.apikey) : undefined,
                        path: "",
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });
    },
    handler: (argv: Arguments): void => { /* no op */ },
};
