// Copyright (C) 2020-1  Aaron Satterlee

import {Arguments} from "yargs";
import {
    createWatchlist, deleteWatchlist,
    getWatchlist,
    getWatchlistsMultiAcct,
    getWatchlistsSingleAcct,
    replaceWatchlist,
    updateWatchlist,
} from "../watchlists";

export default {
    command: "watchlists <command>",
    desc: "Manage your watchlists",
    builder: (yargs: any): any => {
        return yargs
            .command("create <accountId> <orderJSON>",
                "Create a watchlist for a specified <accountId> using the properly formatted <watchlistJSON> (on command line, enclose JSON in quotes, escape inner quotes, e.g. \"{\\\"prop1\\\":\\\"abc\\\"}\" )",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`creating a watchlist for ${argv.accountId}`);
                    }
                    return createWatchlist({
                        accountId: argv.accountId,
                        watchlistJSON: (typeof (argv.watchlistJSON) === "string" ? JSON.parse(argv.watchlistJSON) : argv.watchlistJSON),
                        verbose: argv.verbose || false,
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("replace <watchlistId> <accountId> <watchlistJSON>",
                "Replace an entire watchlist having <watchlistId> for a specified <accountId> using the properly formatted <watchlistJSON> (on command line, enclose JSON in quotes, escape inner quotes, e.g. \"{\\\"prop1\\\":\\\"abc\\\"}\" )",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`replacing watchlist ${argv.watchlistId} for ${argv.accountId}`);
                    }
                    return replaceWatchlist({
                        accountId: argv.accountId,
                        watchlistJSON: (typeof (argv.watchlistJSON) === "string" ? JSON.parse(argv.watchlistJSON) : argv.watchlistJSON),
                        watchlistId: argv.watchlistId,
                        verbose: argv.verbose || false,
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("update <watchlistId> <accountId> <watchlistJSON>",
                "Append/update in place a watchlist having <watchlistId> for a specified <accountId> using the properly formatted <watchlistJSON> (on command line, enclose JSON in quotes, escape inner quotes, e.g. \"{\\\"prop1\\\":\\\"abc\\\"}\" )",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`updating watchlist ${argv.watchlistId} for ${argv.accountId}`);
                    }
                    return updateWatchlist({
                        accountId: argv.accountId,
                        watchlistJSON: (typeof (argv.watchlistJSON) === "string" ? JSON.parse(argv.watchlistJSON) : argv.watchlistJSON),
                        watchlistId: argv.watchlistId,
                        verbose: argv.verbose || false,
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("get <watchlistId> <accountId>",
                "Get a single watchlist having <watchlistId> for a given <accountId>",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting watchlist ${argv.watchlistId} for account ${argv.accountId}`);
                    }
                    return getWatchlist({
                        accountId: argv.accountId,
                        watchlistId: argv.watchlistId,
                        verbose: argv.verbose || false,
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("getall <accountId>",
                "Get all watchlists for a given <accountId>",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting all watchlists for account ${argv.accountId}`);
                    }
                    return getWatchlistsSingleAcct({
                        accountId: argv.accountId,
                        verbose: argv.verbose || false,
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("getmulti",
                "Get all watchlists for all your linked accounts",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting all watchlists for all linked accounts`);
                    }
                    return getWatchlistsMultiAcct({
                        verbose: argv.verbose || false,
                    })
                        .then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("delete <watchlistId> <accountId>",
                "Delete a specified watchlist with <watchlistId> for a given <accountId>",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`deleting watchlist ${argv.watchlistId} for account ${argv.accountId}`);
                    }
                    return deleteWatchlist({
                        accountId: argv.accountId,
                        watchlistId: argv.watchlistId,
                        verbose: argv.verbose || false,
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });
    },
    handler: (argv: Arguments): void => { /* no op */ },
};
