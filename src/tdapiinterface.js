// Copyright (C) 2020  Aaron Satterlee

const axios = require('axios').default;
const fs = require('fs');
const querystring = require('querystring');
const path = require('path');

const instance = axios.create({
    baseURL: 'https://api.tdameritrade.com',
    port: 443,
    headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US',
        'DNT': 1,
        'Host': 'api.tdameritrade.com',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
    }
});

/**
 * Use this for sending an HTTP GET request to api.tdameritrade.com
 * @param {Object} config - takes path, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api GET result, reject is error object
 * @async
 */
const apiGet = async (config) => {
    return apiNoWriteResource(config, 'get');
};

/**
 * Use this for sending an HTTP DELETE request to api.tdameritrade.com
 * @param {Object} config - takes path, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api DELETE result, reject is error object
 * @async
 */
const apiDelete = async (config) => {
    return apiNoWriteResource(config, 'delete');
};

/**
 * Use this for sending an HTTP PATCH request to api.tdameritrade.com
 * @param {Object} config - takes path, bodyJSON, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api PATCH result, reject is error object
 * @async
 */
const apiPatch = async (config) => {
    return apiWriteResource(config, 'patch');
};

/**
 * Use this for sending an HTTP PUT request to api.tdameritrade.com
 * @param {Object} config - takes path, bodyJSON, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api PUT result, reject is error object
 * @async
 */
const apiPut = async (config) => {
    return apiWriteResource(config, 'put');
};

/**
 * Use this for sending an HTTP POST request to api.tdameritrade.com
 * @param {Object} config - takes path, bodyJSON, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api POST result, reject is error object
 * @async
 */
const apiPost = async (config) => {
    return apiWriteResource(config, 'post');
};

const apiNoWriteResource = async (config, method, skipAuth) => {
    const requestConfig = {
        method: method,
        url: config.path,
        headers: {}
    }

    if (!skipAuth) {
        const authResponse = await getAuthentication(config);
        const token = authResponse.access_token;

        if (!config.apikey) {
            requestConfig.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return performAxiosRequest(requestConfig);
};

const apiWriteResource = async (config, method, skipAuth) => {
    const requestConfig = {
        method: method,
        url: config.path,
        headers: {
            'Content-Type': 'application/json'
        },
        data: config.bodyJSON
    };

    if (!skipAuth) {
        const authResponse = await getAuthentication(config);
        const token = authResponse.access_token;

        if (!config.apikey) {
            requestConfig.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return performAxiosRequest(requestConfig);
};

const performAxiosRequest = async (requestConfig) => {
    return new Promise((res, rej) => {
        instance.request(requestConfig)
            .then(function (response) {
                console.log(response.headers);
                res(response.data);
            })
            .catch(function (error) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                    rej(`ERROR [${error.response.status}]: ${error.response.data}`);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                    rej(`The request was made but no response was received: ${error.request}`);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                    rej(`An error occurred while setting up the request: ${error.message}`);
                }
                console.log(error.config);
                rej(error.config);
            });
    });
};

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

    const authConfig = auth_config || require(path.join(process.cwd(), `/config/tdaclientauth.json`));
    const requestConfig = {
        method: 'post',
        url: '/v1/oauth2/token',
        data: getNewAccessTokenPostData(authConfig),
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
    }
    const result = await performAxiosRequest(requestConfig);

    Object.assign(authConfig, result);
    await writeOutAuthResultToFile(authConfig, config);
    return authConfig;
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

module.exports = { apiGet, apiPut, apiDelete, apiPost, apiPatch,
    doAuthenticationHandshake, refreshAuthentication, getAuthentication };
