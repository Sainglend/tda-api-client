import {
    EMarkets,
    getMultipleMarketHours,
    getSingleMarketHours,
    IGetMultiMarketHoursConfig,
    IGetSingleMarketHoursConfig,
    IMarketMarketHours
} from "./markethours";

import testAuthConfig from "./test_tdaclientauth.json";
import path from "path";
const testauthpath = path.join(".", "test_tdaclientauth.json");

describe("markethours", () => {
    test("get single market hours", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: IGetSingleMarketHoursConfig = {
            market: EMarkets.EQUITY,
            date: "2021-12-27",
            authConfig: testAuthConfig,
            authConfigFileLocation: testauthpath,
        };
        const result: IMarketMarketHours = await getSingleMarketHours(config);
        expect(result).toBeTruthy();

        expect(Object.keys(result).length).toBe(1);
        const topLevelKey = Object.keys(result)[0];
        expect(Object.keys(result[topLevelKey]).length).toBe(1);
        const secondLevelKey = Object.keys(result[topLevelKey])[0];

        const hours = result[topLevelKey][secondLevelKey];
        expect(hours.date).toBe(config.date);
    });

    test("get single market hours unauthenticated", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: IGetSingleMarketHoursConfig = {
            market: EMarkets.EQUITY,
            date: "2021-12-27",
            apikey: testAuthConfig.client_id,
            authConfigFileLocation: testauthpath,
        };
        const result: IMarketMarketHours = await getSingleMarketHours(config);
        expect(result).toBeTruthy();

        expect(Object.keys(result).length).toBe(1);
        const topLevelKey = Object.keys(result)[0];
        expect(Object.keys(result[topLevelKey]).length).toBe(1);
        const secondLevelKey = Object.keys(result[topLevelKey])[0];

        const hours = result[topLevelKey][secondLevelKey];
        expect(hours.date).toBe(config.date);
    });

    test("get multiple market hours", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: IGetMultiMarketHoursConfig = {
            markets: [EMarkets.EQUITY, EMarkets.BOND, EMarkets.FOREX, EMarkets.OPTION, EMarkets.FUTURE],
            date: "2021-12-27",
            authConfig: testAuthConfig,
            authConfigFileLocation: testauthpath,
        };
        const result: IMarketMarketHours = await getMultipleMarketHours(config);
        expect(result).toBeTruthy();

        expect(Object.keys(result).length).toBe(5);
        expect(Object.keys(result).sort().join(",")).toBe("bond,equity,forex,future,option");
    });

    test("get multiple market hours unauthenticated", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: IGetMultiMarketHoursConfig = {
            markets: [EMarkets.EQUITY, EMarkets.BOND, EMarkets.FOREX, EMarkets.OPTION, EMarkets.FUTURE],
            date: "2021-12-27",
            apikey: testAuthConfig.client_id,
            authConfigFileLocation: testauthpath,
        };
        const result: IMarketMarketHours = await getMultipleMarketHours(config);
        expect(result).toBeTruthy();

        expect(Object.keys(result).length).toBe(5);
        expect(Object.keys(result).sort().join(",")).toBe("bond,equity,forex,future,option");
    });
});
