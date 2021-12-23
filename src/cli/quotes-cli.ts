// Copyright (C) 2020-1 Aaron Satterlee

import {Arguments} from "yargs";
import {getQuotes} from "../quotes";

export default {
    command: "quotes <command>",
    desc: "Get quotes for one or more symbols",
    builder: (yargs: any): any => {
        return yargs
            .command("get <symbols> [apikey]",
                "Get quotes for one or more symbols using a comma-separated string, e.g. F,O,TSLA and may optionally  use your apikey for an unauthenticated delayed request",
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting quotes for ${argv.symbols}`);
                    }
                    return getQuotes({
                        symbol: argv.symbols,
                        apikey: argv.apikey || "",
                        verbose: argv.verbose || false,
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });
    },
    handler: (argv: Arguments): void => { /* no op */ },
};
