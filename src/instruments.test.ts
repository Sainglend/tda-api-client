import testAuthConfig from "./test_tdaclientauth.json";
import path from "path";
import {
    EProjectionType,
    getInstrument,
    IGetInstrumentConfig,
    ISearchInstrumentsConfig, ISearchInstrumentsFundamentalsConfig, searchInstrumentFundamentals,
    searchInstruments,
} from "./instruments";
const testauthpath = path.join(__dirname, "test_tdaclientauth.json");

describe("instruments", () => {
    test("search instrument", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: ISearchInstrumentsConfig = {
            symbol: "MSFT",
            projection: EProjectionType.SYMBOL_SEARCH,
            authConfigFileLocation: testauthpath,
        };
        const result = await searchInstruments(config);
        expect(result).toBeTruthy();
        // @ts-ignore
        expect(result["MSFT"].symbol).toBe("MSFT");
    });

    test("search instrument unauthenticated", async () => {
        const config: ISearchInstrumentsConfig = {
            symbol: "MSFT",
            projection: EProjectionType.SYMBOL_SEARCH,
            apikey: testAuthConfig.client_id,
        };
        const result = await searchInstruments(config);
        expect(result).toBeTruthy();
        // @ts-ignore
        expect(result["MSFT"].symbol).toBe("MSFT");
    });

    test("search instrument with regex", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: ISearchInstrumentsConfig = {
            symbol: "MSF.*",
            projection: EProjectionType.SYMBOL_REGEX,
            authConfigFileLocation: testauthpath,
        };
        const result = await searchInstruments(config);
        expect(result).toBeTruthy();
        expect(Array.isArray(Object.keys(result))).toBe(true);
        expect(Object.keys(result).length).toBeGreaterThan(0);
        // @ts-ignore
        expect(result["MSFT"].symbol).toBe("MSFT");
    });

    test("search instrument with regex unauthenticated", async () => {
        const config: ISearchInstrumentsConfig = {
            symbol: "MSF.*",
            projection: EProjectionType.SYMBOL_REGEX,
            apikey: testAuthConfig.client_id,
        };
        const result = await searchInstruments(config);
        expect(result).toBeTruthy();
        expect(Array.isArray(Object.keys(result))).toBe(true);
        expect(Object.keys(result).length).toBeGreaterThan(0);
        // @ts-ignore
        expect(result["MSFT"].symbol).toBe("MSFT");
    });

    test("search instrument fundamentals", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: ISearchInstrumentsFundamentalsConfig = {
            symbol: "MSFT",
            authConfigFileLocation: testauthpath,
        };
        const result = await searchInstrumentFundamentals(config);
        expect(result).toBeTruthy();
        // @ts-ignore
        expect(result["MSFT"].symbol).toBe("MSFT");
        expect(result["MSFT"].fundamental).toBeTruthy();
    });

    test("search instrument fundamentals unauthenticated", async () => {
        const config: ISearchInstrumentsFundamentalsConfig = {
            symbol: "MSFT",
            apikey: testAuthConfig.client_id,
        };
        const result = await searchInstrumentFundamentals(config);
        expect(result).toBeTruthy();
        // @ts-ignore
        expect(result["MSFT"].symbol).toBe("MSFT");
        expect(result["MSFT"].fundamental).toBeTruthy();
    });

    test("get instrument", async () => {
        expect(testAuthConfig).toBeTruthy();
        const config: IGetInstrumentConfig = {
            cusip: "594918104",
            authConfigFileLocation: testauthpath,
        };
        const result = await getInstrument(config);
        expect(result).toBeTruthy();
        // @ts-ignore
        expect(result[0].symbol).toBe("MSFT");
    });

    test("get instrument unauthenticated", async () => {
        const config: IGetInstrumentConfig = {
            cusip: "594918104",
            apikey: testAuthConfig.client_id,
        };
        const result = await getInstrument(config);
        expect(result).toBeTruthy();
        // @ts-ignore
        expect(result[0].symbol).toBe("MSFT");
    });
});
