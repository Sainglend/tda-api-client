// Copyright (C) 2020-2  Aaron Satterlee

import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, Method} from "axios";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import qs from "qs";

const instance: AxiosInstance = axios.create({
    baseURL: "https://api.tdameritrade.com",
    headers: {
        "Accept": "*/*",
        "Accept-Language": "en-US",
        "DNT": 1,
        "Host": "api.tdameritrade.com",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
    },
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
    path?: string,
    bodyJSON?: any,
    queueSettings?: IRestRequestQueueConfig,
}

/**
 * Default authFileLocation is evaluated by:
 *  path.join(process.cwd(), `/config/tdaclientauth.json`);
 * Default fileAccess is READ_WRITE
 */
export interface TacBaseConfig {
    authConfig?: IAuthConfig,
    authConfigFileLocation?: string,
    authConfigFileAccess?: "READ_ONLY" | "READ_WRITE" | "NONE",
    verbose?: boolean,
    apikey?: string,
}

export interface IWriteResponse {
    data: any,
    statusCode: number,
    location: string,
}

const writeMethods = ["patch", "put", "post"];

/**
 * Use this for sending an HTTP GET request to api.tdameritrade.com
 */
export async function apiGet(config: TacRequestConfig): Promise<any> {
    return await apiNoWriteResource(config, "get", false);
}

/**
 * Use this for sending an HTTP DELETE request to api.tdameritrade.com
 */
export async function apiDelete(config: TacRequestConfig): Promise<any> {
    return await apiNoWriteResource(config, "delete", false);
}

/**
 * Use this for sending an HTTP PATCH request to api.tdameritrade.com
 */
export async function apiPatch(config: TacRequestConfig): Promise<IWriteResponse> {
    return await apiWriteResource(config, "patch", false);
}

/**
 * Use this for sending an HTTP PUT request to api.tdameritrade.com
 */
export async function apiPut(config: TacRequestConfig): Promise<IWriteResponse> {
    return await apiWriteResource(config, "put", false);
}

/**
 * Use this for sending an HTTP POST request to api.tdameritrade.com
 */
export async function apiPost(config: TacRequestConfig): Promise<IWriteResponse> {
    return await apiWriteResource(config, "post", false);
}

/**
 * Use this to get a new refresh_token from a code obtained from trading credentials authorization.
 * This will generate a new refresh-token, valid for 60 days, that is used to generate an access_token as needed.
 * See authREADME.md for further explanation. This would be equivalent to steps 7-9.
 * Required config fields are: code, client_id, redirect_uri
 */
export async function refreshAPIAuthorization(config?: TacBaseConfig): Promise<IAuthConfig> {
    if (config?.verbose) {
        console.log("refreshing authorization");
    }
    let authConfig = config?.authConfig;
    if (!authConfig && (!config?.authConfigFileAccess || config?.authConfigFileAccess !== "NONE")) {
        authConfig = require(config?.authConfigFileLocation ?? path.join(process.cwd(), `/config/tdaclientauth.json`));
    }
    if (!authConfig) {
        throw new Error("AuthConfig was not provided or the file was not found");
    } else if (!authConfig.refresh_token) {
        throw new Error("AuthConfig does not contain a refresh_token");
    } else if (!authConfig.client_id) {
        throw new Error("AuthConfig does not contain a client_id");
    }

    return await doAuthRequest(
        authConfig,
        qs.stringify({
            "grant_type": "authorization_code",
            "refresh_token": "",
            "access_type": "offline",
            "code": authConfig.code,
            "client_id": authConfig.client_id,
            "redirect_uri": authConfig.redirect_uri,
        }),
        config,
    );
}

/**
 * Use this to force the refresh of the access_token, regardless of whether it is expired.
 * Returns auth info object with the all-important access_token.
 * This is optionally written to the auth json file.
 */
export async function refreshAPIAuthentication(config?: TacBaseConfig): Promise<IAuthConfig> {
    if (config?.verbose) {
        console.log("refreshing authentication");
    }
    let authConfig = config?.authConfig;
    if (!authConfig && (!config?.authConfigFileAccess || config?.authConfigFileAccess !== "NONE")) {
        authConfig = require(config?.authConfigFileLocation ?? path.join(process.cwd(), `/config/tdaclientauth.json`));
    }
    if (!authConfig) {
        throw new Error("AuthConfig was not provided or the file was not found");
    } else if (!authConfig.refresh_token) {
        throw new Error("AuthConfig does not contain a refresh_token");
    } else if (!authConfig.client_id) {
        throw new Error("AuthConfig does not contain a client_id");
    }

    return await doAuthRequest(
        authConfig,
        qs.stringify({
            "grant_type": "refresh_token",
            "refresh_token": authConfig.refresh_token,
            "access_type": "",
            "code": "",
            "client_id": authConfig.client_id,
            "redirect_uri": "",
        }),
        config,
    );
}

/**
 * Use this to get authentication info. Will serve up local copy if not yet expired.
 */
export async function getAPIAuthentication(config?: TacBaseConfig): Promise<IAuthConfig> {
    let authConfig = config?.authConfig;
    if (!authConfig && (!config?.authConfigFileAccess || config?.authConfigFileAccess !== "NONE")) {
        authConfig = require(config?.authConfigFileLocation ?? path.join(process.cwd(), `/config/tdaclientauth.json`));
    }
    if (!authConfig) {
        throw new Error("AuthConfig was not provided or the file was not found");
    } else if (!authConfig.refresh_token) {
        throw new Error("AuthConfig does not contain a refresh_token");
    } else if (!authConfig.client_id) {
        throw new Error("AuthConfig does not contain a client_id");
    }

    if (!authConfig.expires_on || authConfig.expires_on < Date.now() + (10 * 60 * 1000)) {
        return await refreshAPIAuthentication({...config, authConfig});
    } else {
        if (config?.verbose) {
            console.log("not refreshing authentication as it has not expired");
        }
        return authConfig;
    }
}

async function requestWrapper(config: TacRequestConfig, method: Method, skipAuth: boolean, res: any, rej: any): Promise<void> {
    try {
        if (config.queueSettings?.cbPre) processCallback(config.queueSettings.cbPre);
        const result = writeMethods.includes(method)
            ? await apiWriteResource({ ...config, queueSettings: {enqueue: false}}, method, skipAuth)
            : await apiNoWriteResource({ ...config, queueSettings: {enqueue: false}}, method, skipAuth);
        res(result);
        if (config.queueSettings?.cbPost) processCallback(config.queueSettings.cbPost);
    } catch (e) {
        rej(e);
    }
}

async function processCallback(cb: any): Promise<void> {
    cb();
}

async function apiNoWriteResource(config: TacRequestConfig, method: Method, skipAuth: boolean): Promise<any> {
    if (!config.queueSettings || config.queueSettings.enqueue) {
        return new Promise((res, rej) => queue.qPush({ id: crypto.randomBytes(16).toString("utf-8"), config, method, res, rej, deleted: false }));
    }
    const requestConfig: AxiosRequestConfig = {
        method,
        url: config.path ?? "",
        headers: {},
    };

    if (!config.apikey && !skipAuth) {
        const authResponse = await getAPIAuthentication(config);
        const token = authResponse.access_token;
        // @ts-ignore
        requestConfig.headers["Authorization"] = `Bearer ${token}`;
    }

    return await performAxiosRequest(requestConfig, true);
}

async function apiWriteResource(config: TacRequestConfig, method: Method, skipAuth: boolean): Promise<IWriteResponse> {
    if (!config.queueSettings || config.queueSettings.enqueue) {
        return new Promise((res, rej) => queue.qPush({ id: crypto.randomBytes(16).toString("utf-8"), config, method, res, rej, deleted: false }));
    }
    const requestConfig = {
        method: method,
        url: config.path,
        headers: {
            "Content-Type": "application/json",
        },
        data: config.bodyJSON,
    };

    if (!config.apikey && !skipAuth) {
        const authResponse = await getAPIAuthentication(config);
        const token = authResponse.access_token;
        // @ts-ignore
        requestConfig.headers["Authorization"] = `Bearer ${token}`;
    }

    return await performAxiosRequest(requestConfig, false);
}

async function performAxiosRequest(requestConfig: AxiosRequestConfig, expectData: boolean): Promise<IWriteResponse> {
    return await new Promise<IWriteResponse>((res, rej) => {
        instance.request(requestConfig)
            .then(function (response: AxiosResponse) {
                if (expectData) {
                    res(response.data);
                } else {
                    res({
                        data: response.data,
                        statusCode: response.status,
                        location: response.headers.location || response.headers["content-location"],
                    });
                }
            })
            .catch(function (error: AxiosError) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    rej(`ERROR [${error.response.status}] [${requestConfig.method} ${requestConfig.url}]: ${JSON.stringify(error.response.data)}`);
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
}

async function writeOutAuthResultToFile(authConfig: IAuthConfig, config?: TacBaseConfig): Promise<IAuthConfig> {
    if (config?.authConfigFileAccess && ["READ_ONLY", "NONE"].includes(config.authConfigFileAccess)) return authConfig;

    return await new Promise<IAuthConfig>((resolve, reject) => {
        const filePath = config?.authConfigFileLocation ?? path.join(process.cwd(), `/config/tdaclientauth.json`);
        if (config?.verbose) {
            console.log(`writing new auth data to ${filePath}`);
        }
        fs.writeFile(filePath, JSON.stringify(authConfig, null, 2), (err) => {
            if (err) reject(err);
            resolve(authConfig);
        });
    });
}

async function doAuthRequest(authConfig: IAuthConfig, data: any, config?: TacBaseConfig): Promise<IAuthConfig> {
    const requestConfig: AxiosRequestConfig = {
        method: "post",
        url: "/v1/oauth2/token",
        data,
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip",
            "Accept-Language": "en-US",
            "Content-Type": "application/x-www-form-urlencoded",
            "DNT": 1,
            "Host": "api.tdameritrade.com",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
        },
    };
    const result = await performAxiosRequest(requestConfig, true);

    authConfig.expires_on = Date.now() + (authConfig.expires_in ? authConfig.expires_in * 1000 : 0);
    Object.assign(authConfig, result);
    await writeOutAuthResultToFile(authConfig, config);
    return authConfig;
}

class RequestQueue {
    requestQueue: IQueuedRequestInternal[];
    minimumSpacingMS: number;
    timeoutIntervalId: any;
    lastRequestTime: number;

    constructor() {
        this.requestQueue = [];
        this.minimumSpacingMS = 0;
        this.timeoutIntervalId = 0;
        this.lastRequestTime = 0;
    }

    setSpacing(ms: number) {
        this.minimumSpacingMS = Math.max(ms, 0);
        if (this.timeoutIntervalId) {
            clearInterval(this.timeoutIntervalId);
            this.timeoutIntervalId = 0;
        }
        if (ms === 0) {
            const length = this.requestQueue.length;
            for (let i = 0; i < length; i++) this.dequeueAndProcess();
        } else {
            this.dequeueAndProcess();
        }
    }

    getSpacing() {
        return this.minimumSpacingMS;
    }

    qPush(request: IQueuedRequestInternal) {
        if (request.config.queueSettings?.isPriority) this.requestQueue.unshift(request);
        else this.requestQueue.push(request);

        if (request.config.queueSettings?.cbEnqueued) {
            request.config.queueSettings?.cbEnqueued(request.id, this.requestQueue.length);
        }
        if (!this.timeoutIntervalId) {
            this.dequeueAndProcess();
        }
    }

    private dequeueAndProcess() {
        if (this.requestQueue.length > 0 && (Date.now() - this.lastRequestTime) > this.minimumSpacingMS) {
            let req: IQueuedRequestInternal | undefined = this.requestQueue.shift();
            while (req && req.deleted) {
                req = this.requestQueue.shift();
            }
            if (req && !req.deleted) {
                this.lastRequestTime = Date.now();
                requestWrapper(req.config, req.method, false, req.res, req.rej);
            }
            // if we don't have a timed interval set up but we should, then do it!
            if (!this.timeoutIntervalId && this.minimumSpacingMS > 0) {
                this.timeoutIntervalId = setInterval(this.dequeueAndProcess.bind(this), this.minimumSpacingMS);
            }
        } else {
            this.qSleep();
        }
    }

    qClear(): void {
        this.requestQueue = [];
    }

    qInfo(): IQueuedRequest[] {
        return this.requestQueue.filter(q => !q.deleted).map(q => ({ ...q.config, queuedId: q.id }));
    }

    deleteRequestById(id: string): boolean {
        const idx = this.requestQueue.findIndex((q: IQueuedRequestInternal) => q.id === id);
        if (idx >= 0) {
            this.requestQueue[idx].deleted = true;
            return true;
        }
        return false;
    }

    private qSleep() {
        if (this.timeoutIntervalId) {
            clearTimeout(this.timeoutIntervalId);
            this.timeoutIntervalId = 0;
        }
    }
}

const queue = new RequestQueue();

class TDARestRequestQueue {
    restQueueClear(): void {
        queue.qClear();
    }

    getRestQueueInfo(): IQueuedRequest[] {
        return queue.qInfo();
    }

    setRestQueueSpacing(ms = 510): void {
        queue.setSpacing(ms);
    }

    getRestQueueSpacing(): number {
        return queue.getSpacing();
    }

    deleteRequestById(id: string): boolean {
        return queue.deleteRequestById(id);
    }
}

export const tdaRestQueue = new TDARestRequestQueue();

export interface IRestRequestQueueConfig {
    enqueue: boolean,
    isPriority?: boolean,
    cbPre?: () => any,
    cbPost?: () => any,
    cbEnqueued?: (requestId: string, queueSize: number) => any,
}

interface IQueuedRequestInternal {
    id: string,
    config: TacRequestConfig,
    method: Method,
    res: any,
    rej: any,
    deleted: boolean,
}

export interface IQueuedRequest extends TacRequestConfig {
    queuedId: string,
}
