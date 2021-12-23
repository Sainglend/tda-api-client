// Copyright (C) 2020-1  Aaron Satterlee

import {Arguments} from "yargs";
import {getAPIAuthentication, refreshAPIAuthentication, refreshAPIAuthorization} from "../authentication";

export default {
    command: "auth <command>",
    desc: "Perform some authentication operations",
    builder: (yargs: any) => {
        return yargs
            .command("get",
                "Gets the current authentication data that is locally stored, and refreshes the access_token if expired",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting local auth data`);
                    }
                    return getAPIAuthentication({ verbose: String(argv.verbose) === "true" })
                        .then(data => JSON.stringify(data, null, 2))
                        .then(console.log)
                        .catch(console.log);
                })
            .command("refresh",
                "Forces a refresh of the access_token and returns the current authentication data that is locally stored",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`forcing auth refresh and getting local auth data`);
                    }
                    return refreshAPIAuthentication({ verbose: String(argv.verbose) === "true" }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("authorize",
                "Forces a refresh of the access_token and returns the current authentication data that is locally stored",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`forcing auth refresh and getting local auth data`);
                    }
                    return refreshAPIAuthorization({ verbose: String(argv.verbose) === "true" }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });
    },
    handler: (argv: Arguments) => {},
};
