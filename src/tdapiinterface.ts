// Copyright (C) 2020  Aaron Satterlee

import { AxiosError, AxiosResponse } from "axios";
import { IAuthConfig } from "./authentication";
import fs from 'fs';
import querystring from 'querystring';
import path from 'path';
const axios = require('axios').default;

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
export async function apiGet(config: any): Promise<any> {
    return apiNoWriteResource(config, 'get', false);
}

/**
 * Use this for sending an HTTP DELETE request to api.tdameritrade.com
 * @param {Object} config - takes path, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api DELETE result, reject is error object
 * @async
 */
export async function apiDelete(config: any): Promise<any> {
    return apiNoWriteResource(config, 'delete', false);
}

/**
 * Use this for sending an HTTP PATCH request to api.tdameritrade.com
 * @param {Object} config - takes path, bodyJSON, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api PATCH result, reject is error object
 * @async
 */
export async function apiPatch(config: any): Promise<any> {
    return apiWriteResource(config, 'patch', false);
}

/**
 * Use this for sending an HTTP PUT request to api.tdameritrade.com
 * @param {Object} config - takes path, bodyJSON, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api PUT result, reject is error object
 * @async
 */
export async function apiPut(config: any): Promise<any> {
    return apiWriteResource(config, 'put', false);
}

/**
 * Use this for sending an HTTP POST request to api.tdameritrade.com
 * @param {Object} config - takes path, bodyJSON, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api POST result, reject is error object
 * @async
 */
export async function apiPost(config: any) {
    return apiWriteResource(config, 'post', false);
}

const apiNoWriteResource = async (config: any, method: string, skipAuth: boolean) => {
    const requestConfig = {
        method: method,
        url: config.path,
        headers: {}
    }

    if (!config.apikey && !skipAuth) {
        const authResponse = await getAPIAuthentication(config);
        const token = authResponse.access_token;
        // @ts-ignore
        requestConfig.headers['Authorization'] = `Bearer ${token}`;
    }

    return performAxiosRequest(requestConfig, true);
};

async function apiWriteResource(config: any, method: string, skipAuth: boolean) {
    const requestConfig = {
        method: method,
        url: config.path,
        headers: {
            'Content-Type': 'application/json'
        },
        data: config.bodyJSON
    };

    if (!config.apikey && !skipAuth) {
        const authResponse = await getAPIAuthentication(config);
        const token = authResponse.access_token;
        // @ts-ignore
        requestConfig.headers['Authorization'] = `Bearer ${token}`;
    }

    return performAxiosRequest(requestConfig, false);
}

const performAxiosRequest = async (requestConfig: any, expectData: boolean) => {
    return new Promise((res, rej) => {
        instance.request(requestConfig)
            .then(function (response: AxiosResponse) {
                if (expectData) {
                    res(response.data);
                } else {
                    res({
                        data: response.data,
                        statusCode: response.status,
                        location: response.headers.location
                    });
                }
            })
            .catch(function (error: AxiosError) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    rej(`ERROR [${error.response.status}]: ${JSON.stringify(error.response.data)}`);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    rej(`The request was made but no response was received: ${JSON.stringify(error.request)}`);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    rej(`An error occurred while setting up the request: ${JSON.stringify(error.message)}`);
                }
                rej(error.config);
            });
    });
};

async function writeOutAuthResultToFile(authConfig: IAuthConfig, verbose: boolean = false) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(process.cwd(), `/config/tdaclientauth.json`);
        if (verbose) {
            console.log(`writing new auth data to ${filePath}`);
        }
        fs.writeFile(filePath, JSON.stringify(authConfig, null, 2), (err) => {
            if (err) reject(err);
            resolve(authConfig);
        });
    });
}

function getNewAccessTokenPostData(authConfig: IAuthConfig) {
    return querystring.encode({
        "grant_type": "refresh_token",
        "refresh_token": authConfig.refresh_token,
        "access_type": "",
        "code": "",
        "client_id": authConfig.client_id,
        "redirect_uri": ""
    });
}

export async function doAuthenticationHandshake(auth_config: IAuthConfig, verbose: boolean = false): Promise<IAuthConfig> {
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
    const result = await performAxiosRequest(requestConfig, true);

    if (authConfig.expires_in) {
        authConfig.expires_on = Date.now() + (authConfig.expires_in * 1000);
    } else {
        authConfig.expires_on = Date.now();
    }
    Object.assign(authConfig, result);

    if (!auth_config || Object.keys(auth_config).length === 0) {
        await writeOutAuthResultToFile(authConfig, verbose);
    }
    return authConfig;
}

/**
 * Use this to force the refresh of the access_token, regardless if it is expired or not
 * @param {Object} auth_config - optional, meant to be existing local auth data
 * @param {boolean} verbose whether to console.log system messages
 * @returns {Object} auth info object with some calculated fields, including the all-important access_token; this is written to the auth json file in project's config/
 * @async
 */
export async function refreshAPIAuthentication(auth_config: IAuthConfig, verbose: boolean = false): Promise<IAuthConfig> {
    auth_config = auth_config || {};
    if (verbose) {
        console.log('refreshing authentication');
    }
    return doAuthenticationHandshake(auth_config, verbose);
}

/**
 * Use this to get authentication info. Will serve up local copy if not yet expired.
 * @param {Object} config - optional: verbose
 * @returns {Object} auth info object, including the all-important access_token
 * @async
 */
export async function getAPIAuthentication(config: any): Promise<IAuthConfig> {
    config = config || {};
    const authConfig = config.authConfig || require(path.join(process.cwd(), `/config/tdaclientauth.json`));
    if (!authConfig.expires_on || authConfig.expires_on < Date.now() + (10*60*1000)) {
        return refreshAPIAuthentication(authConfig, config.verbose);
    } else {
        if (config.verbose) {
            console.log('not refreshing authentication as it has not expired');
        }
        return authConfig;
    }
}
