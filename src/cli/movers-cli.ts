// Copyright (C) 2020-1  Aaron Satterlee

import {Arguments} from "yargs";
import {CHANGE, DIRECTION, getMovers, INDEX} from "../movers";

export default {
    command: 'movers <command>',
    desc: 'Get market movers',
    builder: (yargs: any) => {
        return yargs
            .command('get <majorIndex> <direction> <change> [apikey]',
                `Get market movers for a specified <majorIndex> ('$COMPX', '$DJI', '$SPX.X'), a given <direction> ('up', 'down'), and the type of <change> ('value', 'percent'), e.g. "get \\$DJI up percent" (notice the escape character). Optionally takes an apikey for an unathenticated request.`,
                {},
                async (argv: Arguments) => {
                    if (argv.verbose) {
                        console.log(`getting market movers for ${argv.majorIndex}, moving ${argv.direction} by ${argv.change}`);
                    }
                    return getMovers({
                        index: INDEX[argv.majorIndex as keyof typeof INDEX],
                        direction: DIRECTION[argv.direction as keyof typeof DIRECTION],
                        change: CHANGE[argv.change as keyof typeof CHANGE],
                        verbose: String(argv.verbose) === "true",
                        apikey: argv.apikey as string,
                        path: "",
                    }).then(data => JSON.stringify(data, null, 2)).then(console.log).catch(console.log);
                });
    },
    handler: (argv: Arguments) => {},
};
