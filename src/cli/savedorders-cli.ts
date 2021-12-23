// Copyright (C) 2020-1 Aaron Satterlee

import {Arguments} from "yargs";
import {createSavedOrder, deleteSavedOrder, getSavedOrderById, getSavedOrders, replaceSavedOrder} from "../savedorders";

export default {
    command: "savedorders <command>",
    desc: "Manage your saved orders",
    builder: (yargs: any): any => {
        return yargs
            .command("create <accountId> <orderJSON>",
                "Create a saved order for a specified <accountId> using the properly formatted <orderJSON> (enclose in quotes, escape inner quotes, e.g. \"{\\\"orderType\\\":\\\"MARKET\\\"}\" )",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`creating a saved order for ${argv.accountId}`);
                    }
                    return createSavedOrder({
                        accountId: argv.accountId as string,
                        orderJSON: (typeof (argv.orderJSON) === "string" ? JSON.parse(argv.orderJSON) : argv.orderJSON),
                        verbose: String(argv.verbose) === "true",
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("replace <savedOrderId> <accountId> <orderJSON>",
                "Replace an existing saved order with <savedOrderId> for a specified <accountId> using the properly formatted <orderJSON> (enclose in quotes, escape inner quotes, e.g. \"{\\\"orderType\\\":\\\"MARKET\\\"}\" )",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`replacing saved order ${argv.savedOrderId} for ${argv.accountId}`);
                    }
                    return replaceSavedOrder({
                        accountId: argv.accountId as string,
                        orderJSON: (typeof (argv.orderJSON) === "string" ? JSON.parse(argv.orderJSON) : argv.orderJSON),
                        savedOrderId: argv.savedOrderId as string,
                        verbose: String(argv.verbose) === "true",
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("get <savedOrderId> <accountId>",
                "Get saved order info for a specified <savedOrderId> for a given <accountId>",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting saved order details for order ${argv.savedOrderId} for account ${argv.accountId}`);
                    }
                    return getSavedOrderById({
                        accountId: argv.accountId as string,
                        savedOrderId: argv.savedOrderId as string,
                        verbose: String(argv.verbose) === "true",
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("delete <savedOrderId> <accountId>",
                "Delete a specified saved order with <savedOrderId> for a given <accountId>",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`deleting saved order ${argv.savedOrderId} for account ${argv.accountId}`);
                    }
                    return deleteSavedOrder({
                        accountId: argv.accountId as string,
                        savedOrderId: argv.savedOrderId as string,
                        verbose: String(argv.verbose) === "true",
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("getall <accountId>",
                "Get all saved orders for a given <accountId>",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting all saved order details account ${argv.accountId}`);
                    }
                    return getSavedOrders({
                        accountId: argv.accountId as string,
                        verbose: String(argv.verbose) === "true",
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });
    },
    handler: (argv: Arguments): void => { /* no op */ },
};
