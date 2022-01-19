#!/usr/bin/env node
// Copyright (C) 2020-2  Aaron Satterlee

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { terminalWidth } = require("yargs");

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("yargs")
    .commandDir("cli")
    .demandCommand()
    .help()
    .wrap(terminalWidth())
    .option("verbose", {description: "Print to console some extra information", type: "boolean"})
    .argv;
