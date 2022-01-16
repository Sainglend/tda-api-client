// Copyright (C) 2020-2  Aaron Satterlee

import {
    doAuthRequest,
    IAuthConfig,
    TacBaseConfig,
} from "./tdapiinterface";
import path from "path";
import qs from "qs";


/**
 * Use this to get a new refresh_token from a code obtained from trading credentials authorization.
 * This will generate a new refresh-token, valid for 60 days, that is used to generate an access_token as needed.
 * See authREADME.md for further explanation. This would be equivalent to steps 7-9.
 */
export async function refreshAPIAuthorization(config?: TacBaseConfig): Promise<IAuthConfig> {
    if (config?.verbose) {
        console.log("refreshing authentication");
    }
    const authConfig = config?.authConfig || require(path.join(process.cwd(), `/config/tdaclientauth.json`));
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
 * Use this to force the refresh of the access_token, regardless if it is expired or not.
 * Returns auth info object with the all-important access_token; this is written to the auth json file in project's config/
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
 * @param {Object} config - optional: verbose
 * @returns {Object} auth info object, including the all-important access_token
 * @async
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

    if (!authConfig.expires_on || authConfig.expires_on < Date.now() + (10*60*1000)) {
        return await refreshAPIAuthentication({ ...config, authConfig });
    } else {
        if (config?.verbose) {
            console.log("not refreshing authentication as it has not expired");
        }
        return authConfig;
    }
}
