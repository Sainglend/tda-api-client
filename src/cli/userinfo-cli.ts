// Copyright (C) 2020-1 Aaron Satterlee

import {Arguments} from "yargs";
import {getStreamerSubKeys, getUserPreferences, getUserPrincipals, updateUserPreferences} from "../userinfo";

export default {
    command: 'userinfo <command>',
    desc: 'Get and update user information such as preferences and keys',
    builder: (yargs: any) => {
        return yargs
            .command('principals [fields]',
                'Get user info. Return additional fields with the [fields] param, a comma-separated string of up to 4 fields: streamerSubscriptionKeys, streamerConnectionInfo, preferences, surrogateIds',
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting principal data with extra fields: ${argv.fields || ''}`);
                    }
                    return getUserPrincipals({
                        fields: argv.fields || '',
                        verbose: argv.verbose || false
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command('pref <accountId>',
                'Get user preferences for a given <accountid>',
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting user preferences for account ${argv.accountId}`);
                    }
                    return getUserPreferences({
                        accountId: argv.accountId,
                        verbose: argv.verbose || false
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command('streamerkeys <accountIds>',
                'Get streamer subscription keys for given <accountids> as a comma-separated list: 123,345',
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting streamer sub keys for accounts ${argv.accountIds}`);
                    }
                    return getStreamerSubKeys({
                        accountIds: argv.accountIds,
                        verbose: argv.verbose || false
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command('updateprefs <accountId> <preferencesJSON>',
                'Update user preferences for a given <accountid> using <preferencesJSON> (on command line, enclose JSON in quotes, escape inner quotes, e.g. "{\\"prop1\\":\\"abc\\"}" )',
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`updating preferences for account ${argv.accountId}`);
                    }
                    return updateUserPreferences({
                        accountId: argv.accountId,
                        preferencesJSON: (typeof (argv.preferencesJSON) === 'string' ? JSON.parse(argv.preferencesJSON) : argv.preferencesJSON),
                        verbose: argv.verbose || false
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });

    },
    handler: (argv: Arguments) => {},
};
