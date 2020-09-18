// Copyright (C) 2020  Aaron Satterlee

const https = require('https');
const fs = require('fs');
const querystring = require('querystring');
const path = require('path');

const writeOutAuthResultToFile = async (authConfig, config) => {
    authConfig.expires_on = Date.now() + (authConfig.expires_in * 1000);
    return new Promise((resolve, reject) => {
        const filePath = path.join(process.cwd(), `/config/tdaclientauth.json`);
        if (config.verbose) {
            console.log(`writing new auth data to ${filePath}`);
        }
        fs.writeFile(filePath, JSON.stringify(authConfig, null, 2), (err) => {
            if (err) reject(err);
            resolve(authConfig);
        });
    });
};

const getNewAccessTokenPostData = (authConfig) => {
    return querystring.encode({
        "grant_type": "refresh_token",
        "refresh_token": authConfig.refresh_token,
        "access_type": "",
        "code": "",
        "client_id": authConfig.client_id,
        "redirect_uri": ""
    });
};

const doAuthenticationHandshake = async (auth_config, config) => {
    return new Promise((resolve, reject) => {
        const apiOptions = {
            hostname: 'api.tdameritrade.com',
            path: '/v1/oauth2/token',
            port: 443,
            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Accept-Encoding': 'gzip',
                'Accept-Language': 'en-US',
                'Content-Type': 'application/x-www-form-urlencoded',
                'DNT': 1,
                'Host': 'api.tdameritrade.com',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site'
            }
        };

        const authConfig = auth_config || require(path.join(process.cwd(), `/config/tdaclientauth.json`));
        const postData = getNewAccessTokenPostData(authConfig);
        apiOptions.headers['Content-Length'] = postData.length;

        const req = https.request(apiOptions, res => {
            switch (res.statusCode) {
                case 200:
                    break;
                case 400:
                    throw new Error('authentication 400: The caller must pass a non null value in the parameter');
                case 401:
                    throw new Error('authentication 401: Unauthorized');
                case 403:
                    throw new Error('authentication 403: Forbidden');
                case 500:
                    throw new Error('authentication 500: Internal server error');
                case 503:
                    throw new Error('authentication 503: temporary problem');
                default:
                    throw new Error('authentication Unknown error');
            }
            const data = [];

            res.on('data', function (chunk) {
                data.push(chunk);
            }).on('end', () => {
                const buffer = Buffer.concat(data);
                const respStr = buffer.toString('utf8');
                const myResponse = JSON.parse(respStr);
                Object.assign(authConfig, myResponse);
                writeOutAuthResultToFile(authConfig, config);
                resolve(authConfig);
            });
        });

        req.on('error', error => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
};

/**
 * Use this to force the refresh of the access_token, regardless if it is expired or not
 * @param {Object} auth_config - optional, meant to be existing local auth data
 * @param {Object} config - optional: verbose
 * @returns {Object} auth info object with some calculated fields, including the all-important access_token; this is written to the auth json file in project's config/
 * @async
 */
const refreshAuthentication = async (auth_config, config) => {
    auth_config = auth_config || {};
    config = config || {};
    if (config.verbose) {
        console.log('refreshing authentication');
    }
    return doAuthenticationHandshake(auth_config, config);
};

/**
 * Use this to get authentication info. Will serve up local copy if not yet expired.
 * @param {Object} config - optional: verbose
 * @returns {Object} auth info object, including the all-important access_token
 * @async
 */
const getAuthentication = async (config) => {
    const authConfig = require(path.join(process.cwd(), `/config/tdaclientauth.json`));
    config = config || {};
    if (!authConfig.expires_on || authConfig.expires_on < Date.now() + (10*60*1000)) {
        return refreshAuthentication(authConfig, config);
    } else {
        if (config.verbose) {
            console.log('not refreshing authentication as it has not expired');
        }
        return authConfig;
    }
};
process.cwd()
exports.api = {
    getAuthentication,
    refreshAuthentication
};
exports.command = 'auth <command>';
exports.desc = 'Perform some authentication operations';
exports.builder = (yargs) => {
  return yargs
    .command('get',
        'Gets the current authentication data that is locally stored, and refreshes the access_token if expired',
        {},
        async (argv) => {
            if (argv.verbose) {
                console.log(`getting local auth data`);
            }
            return getAuthentication({verbose: argv.verbose || false}).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        })
    .command('refresh',
        'Forces a refresh of the access_token and returns the current authentication data that is locally stored',
        {},
        async (argv) => {
            if (argv.verbose) {
                console.log(`forcing auth refresh and getting local auth data`);
            }
            return refreshAuthentication({}, {verbose: argv.verbose || false}).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
        });
};
exports.handler = (argv) => {};
