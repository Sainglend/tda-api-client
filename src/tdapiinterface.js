// Copyright (C) 2020  Aaron Satterlee

const https = require('https');
const auth = require('./authentication');

const apiOptions = {
    hostname: 'api.tdameritrade.com',
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
};

/**
 * Use this for sending an HTTP GET request to api.tdameritrade.com
 * @param {Object} config - takes path, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api GET result, reject is error object
 * @async
 */
const apiGet = async (config) => {
    const authResponse = await auth.api.getAuthentication(config);
    const token = authResponse.access_token;

    const requestOptions = {
        method: 'GET',
        path: config.path,
        ...apiOptions
    };

    if (!config.apikey) {
        requestOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
        if (config.verbose) {
            console.log(`GET ${requestOptions.path}`);
        }
        const req = https.request(requestOptions, res => {
            const bodyIsErrorMsg = res.statusCode < 200 || res.statusCode >= 300;
            const data = [];

            res.on('data', function (chunk) {
                data.push(chunk);
            }).on('end', function () {
                const buffer = Buffer.concat(data);
                const respStr = buffer.toString('utf8');
                const myResponse = JSON.parse(respStr);
                if (bodyIsErrorMsg) {
                    reject(`${res.statusCode}: ${JSON.stringify(myResponse, null, 2)}`);
                } else {
                    resolve(myResponse);
                }
            });
        });

        req.on('error', error => {
            reject(error);
        });

        req.end();
    });
};

/**
 * Use this for sending an HTTP DELETE request to api.tdameritrade.com
 * @param {Object} config - takes path, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api DELETE result, reject is error object
 * @async
 */
const apiDelete = async (config) => {
    const authResponse = await auth.api.getAuthentication(config);
    const token = authResponse.access_token;

    const requestOptions = {
        method: 'DELETE',
        path: config.path,
        ...apiOptions
    };

    if (!config.apikey) {
        requestOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
        if (config.verbose) {
            console.log(`DELETE ${requestOptions.path}`);
        }
        const req = https.request(requestOptions, res => {
            const bodyIsErrorMsg = res.statusCode < 200 || res.statusCode >= 300;

            if (bodyIsErrorMsg) {
                const data = [];

                res.on('data', function (chunk) {
                    data.push(chunk);
                }).on('end', function () {
                    try{
                        const buffer = Buffer.concat(data);
                        const respStr = buffer.toString('utf8');
                        const myResponse = JSON.parse(respStr);
                        reject(`${res.statusCode}: ${JSON.stringify(myResponse, null, 2)}`);
                    } catch (err) {
                        reject(res.statusCode);
                    }
                });
            }
        });

        req.on('error', error => {
            reject(error);
        });

        req.end();
    });
};

/**
 * Use this for sending an HTTP PATCH request to api.tdameritrade.com
 * @param {Object} config - takes path, bodyJSON, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api PATCH result, reject is error object
 * @async
 */
const apiPatch = async (config) => {
    return apiWriteResource(config, 'PATCH');
};

/**
 * Use this for sending an HTTP PUT request to api.tdameritrade.com
 * @param {Object} config - takes path, bodyJSON, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api PUT result, reject is error object
 * @async
 */
const apiPut = async (config) => {
    return apiWriteResource(config, 'PUT');
};

/**
 * Use this for sending an HTTP POST request to api.tdameritrade.com
 * @param {Object} config - takes path, bodyJSON, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api POST result, reject is error object
 * @async
 */
const apiPost = async (config) => {
    return apiWriteResource(config, 'POST');
};

const apiWriteResource = async (config, method) => {
    const authResponse = await auth.api.getAuthentication(config);
    const token = authResponse.access_token;

    const requestOptions = {
        method: method,
        path: config.path,
        ...apiOptions
    };

    const postData = JSON.stringify(config.bodyJSON);
    requestOptions.headers['Content-Length'] = postData.length;
    requestOptions.headers['Content-Type'] = 'application/json';

    if (!config.apikey) {
        requestOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
        if (config.verbose) {
            console.log(`${method} ${requestOptions.path}`);
        }
        const req = https.request(requestOptions, res => {
            const bodyIsErrorMsg = res.statusCode < 200 || res.statusCode >= 300;

            if (bodyIsErrorMsg) {
                const data = [];

                res.on('data', function (chunk) {
                    data.push(chunk);
                }).on('end', function () {
                    const buffer = Buffer.concat(data);
                    const respStr = buffer.toString('utf8');
                    const myResponse = JSON.parse(respStr);
                    reject(`${res.statusCode}: ${JSON.stringify(myResponse, null, 2)}`);
                });
            } else {
                const response = {
                    statusCode: res.statusCode,
                    location: res.headers.location
                };

                resolve(response);
            }
        });

        req.on('error', error => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
};

module.exports = { apiGet, apiPut, apiDelete, apiPost, apiPatch };
