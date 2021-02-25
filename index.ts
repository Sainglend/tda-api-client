// Copyright (C) 2020  Aaron Satterlee
const tdApiInterface = require('tda-api-client');

const accounts = require('./src/accounts');
const authentication = require('./src/authentication');
const instruments = require('./src/instruments');
const markethours = require('./src/markethours');
const movers = require('./src/movers');
const optionchain = require('./src/optionchain');
const orders = require('./src/orders');
const pricehistory = require('./src/pricehistory');
const quotes = require('./src/quotes');
const savedorders = require('./src/savedorders');
const transactions = require('./src/transactions');
const userinfo = require('./src/userinfo');
const watchlists = require('./src/watchlists');

module.exports = {
    accounts: accounts.api,
    authentication: authentication.api,
    instruments: instruments.api,
    markethours: markethours.api,
    movers: movers.api,
    optionchain: optionchain.api,
    orders: orders.api,
    pricehistory: pricehistory.api,
    quotes: quotes.api,
    savedorders: savedorders.api,
    transactions: transactions.api,
    userinfo: userinfo.api,
    watchlists: watchlists.api
};
