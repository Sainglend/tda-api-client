import testAuthConfig from "./test_tdaclientauth.json";
import * as path from "path";
import {getQuote, getQuotes, IGetQuoteConfig, IQuoteResult} from "./quotes";


const testauthpath = path.join(__dirname, "test_tdaclientauth.json");

describe("quotes", () => {
    test("getquote", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: IGetQuoteConfig = {
            symbol: "MSFT",
            authConfigFileLocation: testauthpath,
        };
        const result: IQuoteResult = await getQuote(config);
        expect(result).toBeTruthy();
        expect(result["MSFT"].symbol).toBe("MSFT");
        expect(result["MSFT"].description).toBeTruthy();
    });

    test("getquote unauthenticated", async () => {
        const config: IGetQuoteConfig = {
            symbol: "MSFT",
            apikey: testAuthConfig.client_id,
        };
        const result: IQuoteResult = await getQuote(config);
        expect(result).toBeTruthy();
        expect(result["MSFT"].symbol).toBe("MSFT");
        expect(result["MSFT"].description).toBeTruthy();
    });

    test("getquotes", async () => {
        expect(testAuthConfig).toBeTruthy();

        const symbols = ["MSFT", "/ES", "EUR/USD", "MSFT_011924C330"];
        const config: IGetQuoteConfig = {
            symbol: symbols.join(","),
            authConfigFileLocation: testauthpath,
        };
        const result: IQuoteResult = await getQuotes(config);
        expect(result).toBeTruthy();
        expect(Object.keys(result).sort().join(",")).toBe(symbols.sort().join(","));
        symbols.forEach(s => expect(result[s].symbol).toBe(s));
    });

    test("getquotes unauthenticated", async () => {
        const symbols = ["MSFT", "/ES", "EUR/USD", "MSFT_011924C330"];
        const config: IGetQuoteConfig = {
            symbol: symbols.join(","),
            apikey: testAuthConfig.client_id,
        };
        const result: IQuoteResult = await getQuotes(config);
        expect(result).toBeTruthy();
        expect(Object.keys(result).sort().join(",")).toBe(symbols.sort().join(","));
        symbols.forEach(s => expect(result[s].symbol).toBe(s));
    });

    test("getquotes single symbol unauthenticated", async () => {
        const config: IGetQuoteConfig = {
            symbol: "MSFT",
            apikey: testAuthConfig.client_id,
        };
        const result: IQuoteResult = await getQuotes(config);
        expect(result).toBeTruthy();
        expect(result["MSFT"].symbol).toBe("MSFT");
        expect(result["MSFT"].description).toBeTruthy();
    });

    test("getquote using symbol with special character not a good idea", async () => {
        const config: IGetQuoteConfig = {
            symbol: "EUR/USD",
            apikey: testAuthConfig.client_id,
        };
        let error;
        try {
            await getQuote(config);
        } catch (e) {
            error = e;
        }
        expect(error).toBeTruthy();
        expect(String(error)).toContain("Bad Request");
    });
});
