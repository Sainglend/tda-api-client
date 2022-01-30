#!/usr/bin/env node
// Copyright (C) 2020-2  Aaron Satterlee

import yargs, { terminalWidth } from "yargs";
import { hideBin } from "yargs/helpers";
import accountsCli from "./cli/accounts-cli";
import authenticationCli from "./cli/authentication-cli";
import instrumentsCli from "./cli/instruments-cli";
import markethoursCli from "./cli/markethours-cli";
import moversCli from "./cli/movers-cli";
import optionschainCli from "./cli/optionschain-cli";
import ordersCli from "./cli/orders-cli";
import pricehistoryCli from "./cli/pricehistory-cli";
import quotesCli from "./cli/quotes-cli";
import savedordersCli from "./cli/savedorders-cli";
import transactionsCli from "./cli/transactions-cli";
import userinfoCli from "./cli/userinfo-cli";
import watchlistsCli from "./cli/watchlists-cli";

yargs(hideBin(process.argv))
    // .commandDir("cli", { extensions: ["js, ts"]})
    .command(accountsCli)
    .command(authenticationCli)
    .command(instrumentsCli)
    .command(markethoursCli)
    .command(moversCli)
    .command(optionschainCli)
    .command(ordersCli)
    .command(pricehistoryCli)
    .command(quotesCli)
    .command(savedordersCli)
    .command(transactionsCli)
    .command(userinfoCli)
    .command(watchlistsCli)
    .demandCommand()
    .help()
    .wrap(terminalWidth())
    .option("verbose", {description: "Print to console some extra information", type: "boolean"})
    .argv;
