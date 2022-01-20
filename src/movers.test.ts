import testAuthConfig from "./test_tdaclientauth.json";
import {EChange, EDirection, EIndex, getMovers, IGetMoversConfig, IMover} from "./movers";
import * as path from "path";
const testauthpath = path.join(__dirname, "test_tdaclientauth.json");

describe("movers", () => {
    test("get single market hours", async () => {
        // This test will return an empty array during market closed days
        // TODO: check for whether market is open today
        // TODO: check whether change and direction are required by TDA
        expect(testAuthConfig).toBeTruthy();

        const config: IGetMoversConfig = {
            index: EIndex.SPX,
            direction: EDirection.UP,
            change: EChange.PERCENT,
            authConfigFileLocation: testauthpath,
        };
        const result: IMover[] = await getMovers(config);
        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBe(true);
    });

    test("get single market hours unauthenticated", async () => {
        // This test will return an empty array during market closed days
        // TODO: check for whether market is open today
        // TODO: check whether change and direction are required by TDA

        const config: IGetMoversConfig = {
            index: EIndex.SPX,
            direction: EDirection.UP,
            change: EChange.PERCENT,
            apikey: testAuthConfig.client_id,
        };
        const result: IMover[] = await getMovers(config);
        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBe(true);
    });
});
