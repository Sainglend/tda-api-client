// Copyright (C) 2020-1  Aaron Satterlee

import {Arguments} from "yargs";
import {EContractType, EExpirationMonth, getOptionChain, EOptionType, ERange, EStrategy} from "../optionschain";

export default {
    command: "options <command>",
    desc: "Get option chain info",
    builder: (yargs: any): any => {
        return yargs
            .command("chain <symbol>",
                `Get option chain for a given <symbol>. Use command's options liberally (see detail by issuing command "cli_options.js options chain")`,
                {
                    apikey: {
                        alias: "a",
                        type: "string",
                        desc: "Your OAuth User ID to make an unauthenticated request for delayed data, e.g. ABC@AMER.OAUTHAP",
                    },
                    from: {
                        alias: "f",
                        type: "string",
                        desc: "Option expiration after this date, e.g. 2020-11-22",
                    },
                    to: {
                        alias: "t",
                        type: "string",
                        desc: "Option expriation before this date, e.g. 2020-11-29",
                    },
                    includeQuotes: {
                        alias: "q",
                        type: "string",
                        desc: "Include quotes for options in the option chain. Can be TRUE or FALSE. Default is FALSE.",
                        default: "FALSE",
                        choices: ["FALSE", "TRUE"],
                    },
                    contractType: {
                        alias: "c",
                        type: "string",
                        desc: "Type of contracts to return in the chain. Can be CALL, PUT, or ALL. Default is ALL.",
                        default: "ALL",
                        choices: Object.keys(EOptionType),
                    },
                    strikeCount: {
                        alias: "n",
                        type: "number",
                        desc: "The number of strikes to return above and below the at-the-money price.",
                    },
                    strategy: {
                        alias: "s",
                        type: "string",
                        desc: "Passing a value returns a Strategy Chain. Possible values are SINGLE, ANALYTICAL (allows use of the volatility, underlyingPrice, interestRate, and daysToExpiration params to calculate theoretical values), COVERED, VERTICAL, CALENDAR, STRANGLE, STRADDLE, BUTTERFLY, CONDOR, DIAGONAL, COLLAR, or ROLL. Default is SINGLE.",
                        default: "SINGLE",
                        choices: Object.keys(EStrategy),
                    },
                    interval: {
                        alias: "i",
                        type: "number",
                        desc: "Strike interval for spread strategy chains (see strategy option), i.e. width of spread",
                    },
                    strike: {
                        alias: "k",
                        type: "number",
                        desc: "Provide a strike price to return options only at that strike price.",
                    },
                    range: {
                        alias: "r",
                        type: "string",
                        desc: "Returns options for the given range, e.g. ITM, OTM, NTM",
                        default: "ALL",
                        choices: Object.keys(ERange),
                    },
                    expMonth: {
                        alias: "m",
                        type: "string",
                        desc: "Return only options expiring in the specified month",
                        default: "ALL",
                        choices: Object.keys(EExpirationMonth),
                    },
                    optionType: {
                        alias: "type",
                        type: "string",
                        desc: "Type of contracts to return, standard, non-standard, or all",
                        default: "ALL",
                        choices: Object.keys(EOptionType),
                    },
                    volatility: {
                        alias: ["v", "vol"],
                        type: "number",
                        desc: "Volatility (IV, or implied volatility) to use in calculations, e.g. 29. Applies only to ANALYTICAL strategy chains (see strategy param).",
                    },
                    underlyingPrice: {
                        alias: ["u", "under"],
                        type: "number",
                        desc: "Underlying price to use in calculations, e.g. 34.44. Applies only to ANALYTICAL strategy chains (see strategy param).",
                    },
                    interestRate: {
                        alias: ["int"],
                        type: "number",
                        desc: "Interest rate to use in calculations, e.g. 0.1. Applies only to ANALYTICAL strategy chains (see strategy param).",
                    },
                    daysToExpiration: {
                        alias: ["dte"],
                        type: "number",
                        desc: "Days to expiration to use in calculations. Applies only to ANALYTICAL strategy chains (see strategy param).",
                    },
                },
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting option chain for ${argv.symbol}`);
                    }
                    return getOptionChain({
                        symbol: argv.symbol as string,
                        contractType: argv.contractType != null ? EContractType[argv.contractType as keyof typeof EContractType] : undefined, // has default
                        expMonth: argv.expMonth != null ? EExpirationMonth[argv.expMonth as keyof typeof EExpirationMonth] : undefined, // has default
                        optionType: argv.optionType != null ? EOptionType[argv.optionType as keyof typeof EOptionType] : undefined, // has default
                        strategy: argv.strategy != null ? EStrategy[argv.strategy as keyof typeof EStrategy] : undefined, // has default
                        range: argv.range != null ? ERange[argv.range as keyof typeof ERange] : undefined, // has default
                        includeQuotes: argv.includeQuotes != null ? String(argv.includeQuotes) === "true" : undefined, // has default
                        apikey: (argv.apikey || "") as string,
                        fromDate: (argv.from || "") as string,
                        toDate: (argv.to || "") as string,
                        strikeCount: argv.strikeCount ? Number(argv.strikeCount) : undefined,
                        interval: argv.interval ? Number(argv.interval) : undefined,
                        volatility: argv.volatility ? Number(argv.volatility) : undefined,
                        underlyingPrice: argv.underlyingPrice ? Number(argv.underlyingPrice) : undefined,
                        interestRate: argv.interestRate ? Number(argv.interestRate) : undefined,
                        daysToExpiration: argv.daysToExpiration ? Number(argv.daysToExpiration) : undefined,
                        verbose: String(argv.verbose) === "true",
                        path: "",
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });
    },
    handler: (argv: Arguments): void => { /* no op */ },
};
