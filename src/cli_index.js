#!/usr/bin/env node
// Copyright (C) 2020-1  Aaron Satterlee

const { terminalWidth } = require('yargs');

require('yargs')
  .commandDir('cli')
  .demandCommand()
  .help()
  .wrap(terminalWidth())
    .option('verbose', {description: 'Print to console some extra information', type: 'boolean'})
  .argv;
