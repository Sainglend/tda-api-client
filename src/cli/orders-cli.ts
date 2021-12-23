// Copyright (C) 2020-1 Aaron Satterlee

import {Arguments} from "yargs";
import {cancelOrder, getOrder, getOrdersByQuery, ORDER_STATUS, placeOrder, replaceOrder} from "../orders";

export default {
    command: "orders <command>",
    desc: "Manage your orders",
    builder: (yargs: any): any => {
        return yargs
            .command("place <accountId> <orderJSON>",
                "Place an order for a specified <accountId> using the properly formatted <orderJSON> (enclose in quotes, escape inner quotes, e.g. \"{\\\"orderType\\\":\\\"MARKET\\\"}\" )",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`placing an order for ${argv.accountId}`);
                    }
                    return placeOrder({
                        accountId: argv.accountId,
                        orderJSON: (typeof (argv.orderJSON) === "string") ? JSON.parse(argv.orderJSON) : argv.orderJSON,
                        verbose: argv.verbose || false,
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("replace <orderId> <accountId> <orderJSON>",
                "Replace an existing order with <orderId> for a specified <accountId> using the properly formatted <orderJSON> (enclose in quotes, escape inner quotes, e.g. \"{\\\"orderType\\\":\\\"MARKET\\\"}\" )",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`replacing order ${argv.orderId} for ${argv.accountId}`);
                    }
                    return replaceOrder({
                        accountId: argv.accountId,
                        orderJSON: (typeof (argv.orderJSON) === "string") ? JSON.parse(argv.orderJSON) : argv.orderJSON,
                        orderId: argv.orderId,
                        verbose: argv.verbose || false,
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("getorder <orderId> <accountId>",
                "Get order info for a specified <orderId> for a given <accountId>",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting order details for order ${argv.orderId} for account ${argv.accountId}`);
                    }
                    return getOrder({
                        accountId: argv.accountId,
                        orderId: argv.orderId,
                        verbose: argv.verbose || false,
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("cancel <orderId> <accountId>",
                "Cancel a specified <orderId> for a given <accountId>",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`canceling order ${argv.orderId} for account ${argv.accountId}`);
                    }
                    return cancelOrder({
                        accountId: argv.accountId,
                        orderId: argv.orderId,
                        verbose: argv.verbose || false,
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("getorders [accountId]",
                "Get order info for multiple orders from either all accounts or a specified [accountId]. "
                + "Optional params include maxResults, status, from, to. "
                + "from and to must either both be included or excluded. Date format is yyyy-MM-dd",
                {
                    maxResults: {
                        type: "number",
                    },
                    from: {
                        type: "string",
                        desc: "date, e.g. 2020-11-22",
                    },
                    to: {
                        type: "string",
                        desc: "date, e.g. 2020-11-29",
                    },
                    status: {
                        type: "string",
                        desc: "filter by status",
                        choices: Object.keys(ORDER_STATUS),
                    },
                },
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting order details for multiple orders based on query params`);
                    }
                    return getOrdersByQuery({
                        accountId: argv.accountId || "",
                        maxResults: argv.maxResults || "",
                        fromEnteredTime: argv.from || "",
                        toEnteredTime: argv.to || "",
                        status: argv.status || "",
                        verbose: argv.verbose || false,
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });
    },
    handler: (argv: Arguments): void => { /* no op */ },
};