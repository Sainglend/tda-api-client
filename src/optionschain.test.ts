import testAuthConfig from "./test_tdaclientauth.json";
import * as path from "path";
import {
    EContractType,
    EExpirationMonth,
    ERange,
    EStrategy,
    getOptionChain,
    IGetOptionChainConfig,
    IOptionChain, IOptionStrategyListItem,
} from "./optionschain";

const testauthpath = path.join(__dirname, "test_tdaclientauth.json");

describe("optionschain", () => {
    test("getOptionChain", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: IGetOptionChainConfig = {
            symbol: "MSFT",
            authConfigFileLocation: testauthpath,
        };
        const result: IOptionChain = await getOptionChain(config);
        expect(result).toBeTruthy();
        expect(result.symbol).toBe("MSFT");
        expect(result.isDelayed).toBe(false);
        expect(result.callExpDateMap).toBeTruthy();
        expect(result.putExpDateMap).toBeTruthy();
    });

    test("getOptionChain unauthenticated", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: IGetOptionChainConfig = {
            symbol: "MSFT",
            apikey: testAuthConfig.client_id,
        };
        const result: IOptionChain = await getOptionChain(config);
        expect(result).toBeTruthy();
        expect(result.symbol).toBe("MSFT");
        expect(result.isDelayed).toBe(true);
        expect(result.callExpDateMap).toBeTruthy();
        expect(result.putExpDateMap).toBeTruthy();
    });

    test("getOptionChain with more options unauthenticated", async () => {
        expect(testAuthConfig).toBeTruthy();

        const strikeCount = 5;

        const config: IGetOptionChainConfig = {
            symbol: "MSFT",
            expMonth: EExpirationMonth.JAN,
            contractType: EContractType.CALL,
            strategy: EStrategy.SINGLE,
            range: ERange.OTM,
            includeQuotes: true,
            strikeCount: strikeCount,
            fromDate: new Date().toISOString().substring(0, 10),
            apikey: testAuthConfig.client_id,
        };
        const result: IOptionChain = await getOptionChain(config);
        expect(result).toBeTruthy();
        expect(result.symbol).toBe("MSFT");
        expect(result.isDelayed).toBe(true);
        expect(result.callExpDateMap).toBeTruthy();

        // no puts since I asked for calls only
        expect(result.putExpDateMap).toBeTruthy();
        expect(Object.keys(result.putExpDateMap).length).toBe(0);

        const expiryDatesDTEs: string[] = Object.keys(result.callExpDateMap);
        // confirm 5 strikes per date and that they are OTM
        expiryDatesDTEs.forEach(expiry => {
            const strikes: string[] = Object.keys(result.callExpDateMap[expiry]);
            // 5 strikes
            expect(strikes.length).toBe(5);
            // strike is OTM
            strikes.forEach(s => expect(Number(s) > result.underlyingPrice));
        });
    });

    test("getOptionChain verticals unauthenticated", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: IGetOptionChainConfig = {
            symbol: "MSFT",
            strategy: EStrategy.VERTICAL,
            range: ERange.NTM,
            includeQuotes: true,
            toDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().substring(0, 10),
            apikey: testAuthConfig.client_id,
        };
        const result: IOptionChain = await getOptionChain(config);
        expect(result).toBeTruthy();
        expect(result.symbol).toBe("MSFT");
        expect(result.isDelayed).toBe(true);

        // no calls since I selected a spread strategy
        expect(result.callExpDateMap).toBeTruthy();
        expect(Object.keys(result.callExpDateMap).length).toBe(0);

        // no puts since I selected a spread strategy
        expect(result.putExpDateMap).toBeTruthy();
        expect(Object.keys(result.putExpDateMap).length).toBe(0);

        expect(result.monthlyStrategyList).toBeTruthy();
        expect(result.monthlyStrategyList?.length).toBeGreaterThan(0);

        expect(result.monthlyStrategyList![0].optionStrategyList.length).toBeGreaterThan(0);

        const oneStratItem: IOptionStrategyListItem = result.monthlyStrategyList![0].optionStrategyList[0];
        expect(oneStratItem.primaryLeg).toBeTruthy();
        expect(oneStratItem.secondaryLeg).toBeTruthy();
        expect(oneStratItem.primaryLeg.putCallInd)
            .toBe(oneStratItem.secondaryLeg.putCallInd);
        expect(oneStratItem.strategyBid).toBeTruthy();
        expect(oneStratItem.strategyAsk).toBeTruthy();
    });
});
