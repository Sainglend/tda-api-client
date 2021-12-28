import testAuthConfig from "./test_tdaclientauth.json";
import path from "path";
import {
    EFrequencyByFrequencyType,
    EFrequencyType,
    EFrequencyTypeByPeriodType,
    EPeriodByPeriodType,
    EPeriodType,
    getPriceHistory, IPriceHistory,
    IPriceHistoryConfig,
} from "./pricehistory";

const testauthpath = path.join(__dirname, "test_tdaclientauth.json");

describe("pricehistory", () => {
    test("get pricehistory", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: IPriceHistoryConfig = {
            symbol: "MSFT",
            periodType: EPeriodType.DAY,
            period: EPeriodByPeriodType[EPeriodType.DAY].FIVE,
            frequencyType: EFrequencyTypeByPeriodType[EPeriodType.DAY].MINUTE,
            frequency: EFrequencyByFrequencyType[EFrequencyType.MINUTE].THIRTY,
            getExtendedHours: true,
            authConfigFileLocation: testauthpath,
        };
        const result: IPriceHistory = await getPriceHistory(config);
        expect(result).toBeTruthy();
        expect(result.symbol).toBe("MSFT");
        expect(result.empty).toBe(false);
        expect(result.candles.length).toBeGreaterThan(0);
    });

    test("get pricehistory unauthenticated", async () => {
        const config: IPriceHistoryConfig = {
            symbol: "MSFT",
            periodType: EPeriodType.DAY,
            period: EPeriodByPeriodType[EPeriodType.DAY].FIVE,
            frequencyType: EFrequencyTypeByPeriodType[EPeriodType.DAY].MINUTE,
            frequency: EFrequencyByFrequencyType[EFrequencyType.MINUTE].THIRTY,
            getExtendedHours: true,
            apikey: testAuthConfig.client_id,
        };
        const result: IPriceHistory = await getPriceHistory(config);
        expect(result).toBeTruthy();
        expect(result.symbol).toBe("MSFT");
        expect(result.empty).toBe(false);
        expect(result.candles.length).toBeGreaterThan(0);
    });

    test("get pricehistory with dates", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: IPriceHistoryConfig = {
            symbol: "MSFT",
            periodType: EPeriodType.DAY,
            frequencyType: EFrequencyTypeByPeriodType[EPeriodType.DAY].MINUTE,
            frequency: EFrequencyByFrequencyType[EFrequencyType.MINUTE].THIRTY,
            startDate: Date.now() - 5*24*60*60*1000,
            endDate: Date.now(),
            authConfigFileLocation: testauthpath,
        };
        const result: IPriceHistory = await getPriceHistory(config);
        expect(result).toBeTruthy();
        expect(result.symbol).toBe("MSFT");
        expect(result.empty).toBe(false);
        expect(result.candles.length).toBeGreaterThan(0);
    });
});
