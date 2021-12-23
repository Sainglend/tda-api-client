import {Arguments} from "yargs";
import {getAccount, getAccounts} from "../accounts";

export default {
    command: `accounts <command>`,
    desc: "Get your account info for one or all linked accounts",
    builder: (yargs: any): any => {
        return yargs
            .command("get <accountId> <fields>",
                "Get <accountId> account info that returns data based on <fields>. Fields is a common-separated string like \"positions,orders\"",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log("getting account info for account %s with fields %s", argv.accountId, argv.fields);
                    }
                    return getAccount({
                        accountId: argv.accountId as string,
                        fields: argv.fields as string,
                        verbose: String(argv.verbose) === "true",
                        path: "",
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                })
            .command("getall <fields>",
                "Get account info for all connected accounts. Data returned is based on <fields>, a common-separated string like \"positions,orders\"",
                {},
                async (argv: Arguments) => {
                    if (String(argv.verbose) === "true") {
                        console.log("getting account info for all linked accounts fields %s", argv.fields);
                    }
                    return getAccounts({
                        fields: argv.fields as string,
                        verbose: String(argv.verbose) === "true",
                        path: "",
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });
    },
    handler: (argv: Arguments): void => { /* no op */ },
};
