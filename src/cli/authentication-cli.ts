// Copyright (C) 2020-1  Aaron Satterlee

import {Arguments} from "yargs";
import {getAuthentication, IAuthConfig, refreshAuthentication} from "../authentication";

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
