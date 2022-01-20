import testAuthConfig from "./test_tdaclientauth.json";
import * as path from "path";
import {getQuote, IGetQuoteConfig, IQuoteResult} from "./quotes";
import {getRestQueueSpacing, setRestQueueSpacing} from "./tdapiinterface";
import {EMarkets, getSingleMarketHours, IGetSingleMarketHoursConfig, IMarketMarketHours} from "./markethours";

jest.setTimeout(10000);

const testauthpath = path.join(__dirname, "test_tdaclientauth.json");

interface TimeRecord {
    position: number,
    time: number,
}

function recordTime(arr: TimeRecord[], position: number) {
    arr.push({ position, time: Date.now() });
}

describe("test queue", () => {
    beforeEach(async () => {
        // use this to avoid rate restrictions during testing
        await new Promise<void>((res) => {
            setTimeout(res, 2000);
        });
    });

    test("default queue does fast requests", async () => {
        expect(testAuthConfig).toBeTruthy();
        setRestQueueSpacing(0);
        expect(getRestQueueSpacing()).toBe(0);

        const timeArray: TimeRecord[] = [];

        const config: IGetQuoteConfig = {
            symbol: "MSFT",
            authConfigFileLocation: testauthpath,
        };
        const result0Promise = getQuote({
            ...config,
            queueSettings: {
                enqueue: true,
                cbPre: () => recordTime(timeArray, 0),
            },
        });
        const result1Promise = getQuote({
            ...config,
            queueSettings: {
                enqueue: true,
                cbPre: () => recordTime(timeArray, 1),
            },
        });

        const [result0, result1] = await Promise.all([result0Promise, result1Promise]);
        expect(result0).toBeTruthy();
        expect(result0["MSFT"].symbol).toBe("MSFT");
        expect(result0["MSFT"].description).toBeTruthy();

        expect(result1).toBeTruthy();
        expect(result1["MSFT"].symbol).toBe("MSFT");
        expect(result1["MSFT"].description).toBeTruthy();

        expect(timeArray.length).toBe(2);
        expect(timeArray[1].time - timeArray[0].time).toBeLessThanOrEqual(500);
    });

    test("queue with spacing respects spacing", async () => {
        expect(testAuthConfig).toBeTruthy();
        setRestQueueSpacing(1500);
        expect(getRestQueueSpacing()).toBe(1500);

        const timeArray: TimeRecord[] = [];

        const config: IGetQuoteConfig = {
            symbol: "MSFT",
            authConfigFileLocation: testauthpath,
        };
        const result0Promise = getQuote({
            ...config,
            queueSettings: {
                enqueue: true,
                cbPre: () => recordTime(timeArray, 0),
            },
        });
        const result1Promise = getQuote({
            ...config,
            queueSettings: {
                enqueue: true,
                cbPre: () => recordTime(timeArray, 1),
            },
        });

        const [result0, result1] = await Promise.all([result0Promise, result1Promise]);
        expect(result0).toBeTruthy();
        expect(result0["MSFT"].symbol).toBe("MSFT");
        expect(result0["MSFT"].description).toBeTruthy();

        expect(result1).toBeTruthy();
        expect(result1["MSFT"].symbol).toBe("MSFT");
        expect(result1["MSFT"].description).toBeTruthy();

        expect(timeArray.length).toBe(2);
        expect(timeArray[1].time - timeArray[0].time).toBeGreaterThanOrEqual(1500);
    });

    test("queue with spacing respects spacing across request types", async () => {
        expect(testAuthConfig).toBeTruthy();
        setRestQueueSpacing(2000);
        expect(getRestQueueSpacing()).toBe(2000);

        const timeArray: TimeRecord[] = [];

        const config: IGetQuoteConfig = {
            symbol: "MSFT",
            authConfigFileLocation: testauthpath,
        };
        const hrsConfig: IGetSingleMarketHoursConfig = {
            market: EMarkets.EQUITY,
            date: new Date().toISOString().substring(0, 10),
            authConfigFileLocation: testauthpath,
        };

        const result0Promise = getQuote({
            ...config,
            queueSettings: {
                enqueue: true,
                cbPre: () => recordTime(timeArray, 0),
            },
        });
        const result1Promise = getSingleMarketHours({
            ...hrsConfig,
            queueSettings: {
                enqueue: true,
                cbPre: () => recordTime(timeArray, 1),
            },
        });

        const [result0, result1] = await Promise.all([result0Promise, result1Promise]);
        expect(result0).toBeTruthy();
        expect(result0["MSFT"].symbol).toBe("MSFT");
        expect(result0["MSFT"].description).toBeTruthy();

        expect(result1).toBeTruthy();
        expect(Object.keys(result1).length).toBe(1);
        const topLevelKey = Object.keys(result1)[0];
        expect(Object.keys(result1[topLevelKey]).length).toBe(1);
        const secondLevelKey = Object.keys(result1[topLevelKey])[0];
        const hours = result1[topLevelKey][secondLevelKey];
        expect(hours.date).toBe(hrsConfig.date);

        expect(timeArray.length).toBe(2);
        expect(timeArray[1].time - timeArray[0].time).toBeGreaterThanOrEqual(1500);
    });
});
