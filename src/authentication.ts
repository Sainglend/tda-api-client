// Copyright (C) 2020  Aaron Satterlee

import { Arguments } from "yargs";
import {getAPIAuthentication, refreshAPIAuthentication} from "./tdapiinterface";

export interface IAuthConfig {
    refresh_token: string,
    client_id: string,
    access_token?: string,
    expires_on?: number,
    expires_in?: number
}

/**
 * Use this to force the refresh of the access_token, regardless if it is expired or not
 * @param {Object} auth_config - optional, meant to be existing local auth data
 * @param {Object} config - optional: verbose
 * @returns {Object} auth info object with some calculated fields, including the all-important access_token; this is written to the auth json file in project's config/
 * @async
 */
export async function refreshAuthentication(auth_config: IAuthConfig, config: any) {
    return refreshAPIAuthentication(auth_config, config);
}

/**
 * Use this to get authentication info. Will serve up local copy if not yet expired.
 * @param {Object} config - optional: verbose
 * @returns {Object} auth info object, including the all-important access_token
 * @async
 */
export async function getAuthentication(config: any) {
    return getAPIAuthentication(config);
}

export default {
    command: 'auth <command>',
    desc: 'Perform some authentication operations',
    builder: (yargs: any) => {
        return yargs
            .command('get',
                'Gets the current authentication data that is locally stored, and refreshes the access_token if expired',
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting local auth data`);
                    }
                    return getAuthentication({verbose: argv.verbose || false}).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command('refresh',
                'Forces a refresh of the access_token and returns the current authentication data that is locally stored',
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`forcing auth refresh and getting local auth data`);
                    }
                    return refreshAuthentication({} as IAuthConfig, {verbose: argv.verbose || false}).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });
    },
    handler: (argv: Arguments) => {},
};
