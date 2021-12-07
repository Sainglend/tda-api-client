// Copyright (C) 2020  Aaron Satterlee

import {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import fs from 'fs';
import path from 'path';
import {getAPIAuthentication} from "./authentication";
const axios = require('axios').default;

const instance: AxiosInstance = axios.create({
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

export interface IAuthConfig {
    refresh_token: string,
    client_id: string,
    access_token?: string,
    expires_on?: number,
    expires_in?: number,
    code?: string,
    redirect_uri?: string,
}

export interface TacRequestConfig extends TacBaseConfig {
    path: string,
    bodyJSON?: object,
    apikey?: string,
}

export interface TacBaseConfig {
    authConfig?: IAuthConfig,
    verbose?: boolean,
}

/**
 * Use this for sending an HTTP GET request to api.tdameritrade.com
 * @param {Object} config - takes path, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api GET result, reject is error object
 * @async
 */
export async function apiGet(config: TacRequestConfig): Promise<any> {
    return apiNoWriteResource(config, 'get', false);
}

/**
 * Use this for sending an HTTP DELETE request to api.tdameritrade.com
 * @param {Object} config - takes path, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api DELETE result, reject is error object
 * @async
 */
export async function apiDelete(config: TacRequestConfig): Promise<any> {
    return apiNoWriteResource(config, 'delete', false);
}

/**
 * Use this for sending an HTTP PATCH request to api.tdameritrade.com
 * @param {Object} config - takes path, bodyJSON, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api PATCH result, reject is error object
 * @async
 */
export async function apiPatch(config: TacRequestConfig): Promise<any> {
    return apiWriteResource(config, 'patch', false);
}

/**
 * Use this for sending an HTTP PUT request to api.tdameritrade.com
 * @param {Object} config - takes path, bodyJSON, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api PUT result, reject is error object
 * @async
 */
export async function apiPut(config: TacRequestConfig): Promise<any> {
    return apiWriteResource(config, 'put', false);
}

/**
 * Use this for sending an HTTP POST request to api.tdameritrade.com
 * @param {Object} config - takes path, bodyJSON, apikey (optional; if present this won't be an authenticated request)
 * @returns {Promise<Object>} resolve is api POST result, reject is error object
 * @async
 */
export async function apiPost(config: TacRequestConfig) {
    return apiWriteResource(config, 'post', false);
}

const apiNoWriteResource = async (config: TacRequestConfig, method: string, skipAuth: boolean) => {
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

export async function doAuthRequest(authConfig: IAuthConfig, data: any, verbose: boolean = false) {
    const requestConfig = {
        method: 'post',
        url: '/v1/oauth2/token',
        data,
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

    authConfig.expires_on = Date.now() + (authConfig.expires_in ? authConfig.expires_in * 1000 : 0);
    Object.assign(authConfig, result);
    await writeOutAuthResultToFile(authConfig, verbose);
    return authConfig;
}
