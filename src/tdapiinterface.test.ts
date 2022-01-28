import testAuthConfig from "../test_tdaclientauth.json";
import * as path from "path";
import {getQuote, IGetQuoteConfig, IQuoteResult} from "./quotes";
import {IQueuedRequest, TacRequestConfig, tdaRestQueue} from "./tdapiinterface";
import {EMarkets, getSingleMarketHours, IGetSingleMarketHoursConfig} from "./markethours";
import {EProjectionType, ISearchInstrumentsConfig, searchInstruments} from "./instruments";
import {getAccounts} from "./accounts";

jest.setTimeout(30000);

const testauthpath = path.join(__dirname, "test_tdaclientauth.json");

interface TimeRecord {
    position: number,
    time: number,
}

interface ICallbackRecording {
    enqueued?: CallbackRecord,
    pre?: CallbackRecord,
    result?: CallbackRecord,
    post?: CallbackRecord,
}

interface CallbackRecord {
    time: number,
    data?: any,
}

function recordTime(arr: TimeRecord[], position: number) {
    // console.log("recordTime", position);
    arr.push({ position, time: Date.now() });
}

function callbackCatcher(record: ICallbackRecording, name: string, data?: any) {
    record[name] = { time: Date.now(), data };
}

async function waitPromise(ms: number): Promise<void> {
    return new Promise<void>((res) => {
        setTimeout(res, ms);
    });
}

describe("test REST queue", () => {
    beforeEach(async () => {
        tdaRestQueue.clearRestQueue();
        tdaRestQueue.setRestQueueSpacing(0);
        expect(tdaRestQueue.getRestQueueCount()).toBe(0);
        // use this to avoid rate restrictions during testing
        await waitPromise(2000);
    });

    test("default queue does fast requests", async () => {
        expect(testAuthConfig).toBeTruthy();
        tdaRestQueue.setRestQueueSpacing(0);
        expect(tdaRestQueue.getRestQueueSpacing()).toBe(0);

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
        const timeDiff = 3000;
        tdaRestQueue.setRestQueueSpacing(timeDiff);
        expect(tdaRestQueue.getRestQueueSpacing()).toBe(timeDiff);

        const timeArray: TimeRecord[] = [];

        const config: IGetQuoteConfig = {
            symbol: "MSFT",
            authConfigFileLocation: testauthpath,
        };

        const resultPromises = [];

        for (let i = 0; i < 4; i++) {
            const a = i;
            resultPromises.push(getQuote({
                ...config,
                queueSettings: {
                    enqueue: true,
                    cbPre: () => recordTime(timeArray, a),
                },
            }));
        }

        const results = await Promise.all(resultPromises);
        expect(results.length).toBe(resultPromises.length);
        results.forEach(res => {
            expect(res).toBeTruthy();
            expect(res["MSFT"].symbol).toBe("MSFT");
            expect(res["MSFT"].description).toBeTruthy();
        });

        expect(timeArray.length).toBe(resultPromises.length);
        for (let i = 1; i < results.length; i++) {
            expect(timeArray[i].time - timeArray[i-1].time).toBeGreaterThanOrEqual(.95*timeDiff);
        }
    });

    test("queue with spacing respects spacing across request types", async () => {
        expect(testAuthConfig).toBeTruthy();
        const timeDiff = 2000;
        tdaRestQueue.setRestQueueSpacing(timeDiff);
        expect(tdaRestQueue.getRestQueueSpacing()).toBe(timeDiff);

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
        const searchConfig: ISearchInstrumentsConfig = {
            symbol: "MSFT",
            projection: EProjectionType.SYMBOL_SEARCH,
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
        const result2Promise = searchInstruments({
            ...searchConfig,
            queueSettings: {
                enqueue: true,
                cbPre: () => recordTime(timeArray, 2),
            },
        });

        const [result0, result1, result2] = await Promise.all([result0Promise, result1Promise, result2Promise]);
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

        expect(result2).toBeTruthy();
        expect(result2["MSFT"].symbol).toBe("MSFT");

        expect(timeArray.length).toBe(3);
        expect(timeArray[1].time - timeArray[0].time).toBeGreaterThanOrEqual(.95*timeDiff);
        expect(timeArray[2].time - timeArray[1].time).toBeGreaterThanOrEqual(.95*timeDiff);
    });

    test("test restQueueInfo returns correct results", async () => {
        expect(testAuthConfig).toBeTruthy();
        const timeDiff = 3000;
        tdaRestQueue.setRestQueueSpacing(timeDiff);
        expect(tdaRestQueue.getRestQueueSpacing()).toBe(timeDiff);

        const timeArray: TimeRecord[] = [];

        const config: IGetQuoteConfig = {
            symbol: "MSFT",
            authConfigFileLocation: testauthpath,
        };

        const symbols = ["MSFT", "AAPL", "TSLA", "IBM"];

        const resultPromises = [];

        for (let i = 0; i < 4; i++) {
            const a = i;
            resultPromises.push(getQuote({
                ...config,
                symbol: symbols[a],
                queueSettings: {
                    enqueue: true,
                    cbPre: () => recordTime(timeArray, a),
                },
            }));
        }

        const queueInfo: IQueuedRequest[] = tdaRestQueue.getRestQueueInfo();
        tdaRestQueue.clearRestQueue();

        expect(queueInfo.length).toBe(3);
        for (let i = 0; i < 3; i++) {
            expect(queueInfo[i].queuedId).toBeTruthy();
            expect(queueInfo[i].path.includes(symbols[i]));
        }
    });

    test("clear queue", async () => {
        expect(testAuthConfig).toBeTruthy();
        const timeDiff = 30000;
        tdaRestQueue.setRestQueueSpacing(timeDiff);
        expect(tdaRestQueue.getRestQueueSpacing()).toBe(timeDiff);

        const timeArray: TimeRecord[] = [];

        const config: IGetQuoteConfig = {
            symbol: "MSFT",
            authConfigFileLocation: testauthpath,
        };

        const symbols = ["MSFT", "AAPL", "TSLA", "IBM"];

        const resultPromises = [];

        for (let i = 0; i < 4; i++) {
            const a = i;
            resultPromises.push(getQuote({
                ...config,
                symbol: symbols[a],
                queueSettings: {
                    enqueue: true,
                    cbPre: () => recordTime(timeArray, a),
                },
            }));
        }

        const queueInfoPre: IQueuedRequest[] = tdaRestQueue.getRestQueueInfo();
        tdaRestQueue.clearRestQueue();
        const queueInfoPost: IQueuedRequest[] = tdaRestQueue.getRestQueueInfo();

        expect(queueInfoPre.length).toBe(3);
        for (let i = 0; i < 3; i++) {
            expect(queueInfoPre[i].queuedId).toBeTruthy();
            expect(queueInfoPre[i].path.includes(symbols[i]));
        }
        expect(queueInfoPost.length).toBe(0);
    });

    test("delete queue request id", async () => {
        expect(testAuthConfig).toBeTruthy();
        const timeDiff = 30000;
        tdaRestQueue.setRestQueueSpacing(timeDiff);
        expect(tdaRestQueue.getRestQueueSpacing()).toBe(timeDiff);

        const timeArray: TimeRecord[] = [];

        const config: IGetQuoteConfig = {
            symbol: "MSFT",
            authConfigFileLocation: testauthpath,
        };

        const symbols = ["MSFT", "AAPL", "TSLA", "IBM"];

        const resultPromises = [];

        for (let i = 0; i < 4; i++) {
            const a = i;
            resultPromises.push(getQuote({
                ...config,
                symbol: symbols[a],
                queueSettings: {
                    enqueue: true,
                    cbPre: () => recordTime(timeArray, a),
                },
            }));
        }

        const queueInfoPre: IQueuedRequest[] = tdaRestQueue.getRestQueueInfo();
        expect(queueInfoPre.length).toBe(3);
        const successfulDelete = tdaRestQueue.deleteRequestById(queueInfoPre[0].queuedId);
        expect(successfulDelete).toBe(true);
        const queueInfoPost: IQueuedRequest[] = tdaRestQueue.getRestQueueInfo();

        for (let i = 0; i < 3; i++) {
            expect(queueInfoPre[i].queuedId).toBeTruthy();
            expect(queueInfoPre[i].path.includes(symbols[i]));
        }
        expect(queueInfoPost.length).toBe(2);
        expect(queueInfoPost.findIndex(qItem => qItem.path.includes(symbols[0]))).toBe(-1);
    });

    test("test that explicit non-rate-limited requests immediately execute", async () => {
        expect(testAuthConfig).toBeTruthy();
        const timeDiff = 30000;
        tdaRestQueue.setRestQueueSpacing(timeDiff);
        expect(tdaRestQueue.getRestQueueSpacing()).toBe(timeDiff);

        const timeArray: TimeRecord[] = [];

        const config: IGetQuoteConfig = {
            symbol: "MSFT",
            authConfigFileLocation: testauthpath,
        };

        const symbols = ["MSFT", "AAPL", "TSLA", "IBM"];

        const resultPromises = [];

        for (let i = 0; i < 4; i++) {
            const a = i;
            resultPromises.push(getQuote({
                ...config,
                symbol: symbols[a],
                queueSettings: {
                    enqueue: (a < 3), // false for a === 3, so should immediately execute
                    cbPre: () => recordTime(timeArray, a),
                },
            }));
        }

        const queueInfoPre: IQueuedRequest[] = tdaRestQueue.getRestQueueInfo();
        expect(queueInfoPre.length).toBe(2);
        tdaRestQueue.clearRestQueue();

        for (let i = 0; i < 2; i++) {
            expect(queueInfoPre[i].queuedId).toBeTruthy();
            expect(queueInfoPre[i].path.includes(symbols[i+1]));
        }

        expect(timeArray.length).toBe(1);
        const immediateResult = await resultPromises[3];
        expect(Date.now() - timeArray[0].time).toBeLessThan(1000);
    });

    test("test that implicit non-rate-limited requests immediately execute", async () => {
        expect(testAuthConfig).toBeTruthy();
        const timeDiff = 30000;
        tdaRestQueue.setRestQueueSpacing(timeDiff);
        expect(tdaRestQueue.getRestQueueSpacing()).toBe(timeDiff);

        const timeArray: TimeRecord[] = [];

        const config: IGetQuoteConfig = {
            symbol: "MSFT",
            authConfigFileLocation: testauthpath,
        };

        const symbols = ["MSFT", "AAPL", "TSLA"];

        const resultPromises = [];

        for (let i = 0; i < 3; i++) {
            const a = i;
            resultPromises.push(getQuote({
                ...config,
                symbol: symbols[a],
                queueSettings: {
                    enqueue: true, // false for a === 3, so should immediately execute
                    cbPre: () => recordTime(timeArray, a),
                },
            }));
        }
        resultPromises.push(getAccounts({ authConfigFileLocation: testauthpath }));

        const queueInfoPre: IQueuedRequest[] = tdaRestQueue.getRestQueueInfo();
        expect(queueInfoPre.length).toBe(2);
        tdaRestQueue.clearRestQueue();

        for (let i = 0; i < 2; i++) {
            expect(queueInfoPre[i].queuedId).toBeTruthy();
            expect(queueInfoPre[i].path.includes(symbols[i+1]));
        }

        expect(timeArray.length).toBe(1);
        const immediateResult = await resultPromises[3];
        expect(Date.now() - timeArray[0].time).toBeLessThan(1000);
    });

    test("test priority", async () => {
        expect(testAuthConfig).toBeTruthy();
        const timeDiff = 2000;
        tdaRestQueue.setRestQueueSpacing(timeDiff);
        expect(tdaRestQueue.getRestQueueSpacing()).toBe(timeDiff);

        const timeArray: TimeRecord[] = [];
        const symbols = ["MSFT", "TSLA", "GME", "T"];
        const resultPromises = [];

        for (let i = 0; i < 4; i++) {
            const a = i;
            resultPromises.push(getQuote({
                authConfigFileLocation: testauthpath,
                symbol: symbols[i],
                queueSettings: {
                    enqueue: true,
                    isPriority: i === 3,
                    cbPre: () => recordTime(timeArray, a),
                },
            }));
        }

        const results = await Promise.all(resultPromises);
        expect(results.length).toBe(resultPromises.length);

        expect(timeArray.length).toBe(resultPromises.length);
        expect(timeArray[1].position).toBe(3);
        expect(timeArray[1].time).toBeLessThan(timeArray[2].time);
        expect(timeArray[1].time).toBeLessThan(timeArray[3].time);
    });

    test("test callbacks", async () => {
        expect(testAuthConfig).toBeTruthy();
        const timeDiff = 2000;
        tdaRestQueue.setRestQueueSpacing(timeDiff);
        expect(tdaRestQueue.getRestQueueSpacing()).toBe(timeDiff);
        const callbackRecorder: ICallbackRecording = {};
        const startTime = Date.now();

        const result: IQuoteResult = await getQuote({
            authConfigFileLocation: testauthpath,
            symbol: "T",
            queueSettings: {
                enqueue: true,
                cbEnqueued: (requestId) => callbackCatcher(callbackRecorder, "enqueued", requestId),
                cbPre: () => callbackCatcher(callbackRecorder, "pre"),
                cbResult: (result1: IQuoteResult) => callbackCatcher(callbackRecorder, "result", result1),
                cbPost: () => callbackCatcher(callbackRecorder, "post"),
            },
        });
        expect(result["T"].symbol).toBe("T");
        expect(callbackRecorder.enqueued).toBeTruthy();
        expect(callbackRecorder.enqueued.time).toBeGreaterThanOrEqual(startTime);
        // request id: random bytes
        expect(callbackRecorder.enqueued.data).toBeTruthy();
        expect(callbackRecorder.pre).toBeTruthy();
        expect(callbackRecorder.pre.time).toBeGreaterThanOrEqual(callbackRecorder.enqueued.time);
        expect(callbackRecorder.result).toBeTruthy();
        expect(callbackRecorder.result.time).toBeGreaterThanOrEqual(callbackRecorder.pre.time);
        expect(callbackRecorder.result.data).toEqual(result);
        expect(callbackRecorder.post).toBeTruthy();
        expect(callbackRecorder.post.time).toBeGreaterThanOrEqual(callbackRecorder.result.time);
    });

    test("queue works again after emptying naturally", async () => {
        expect(testAuthConfig).toBeTruthy();
        const timeDiff = 1000;
        tdaRestQueue.setRestQueueSpacing(timeDiff);
        expect(tdaRestQueue.getRestQueueSpacing()).toBe(timeDiff);

        const timeArray: TimeRecord[] = [];
        const symbols = ["MSFT", "AAPL", "TSLA", "IBM"];
        const resultPromises = [];

        for (let i = 0; i < 4; i++) {
            const a = i;
            resultPromises.push(getQuote({
                authConfigFileLocation: testauthpath,
                symbol: symbols[a],
                queueSettings: {
                    enqueue: true,
                },
            }));
        }

        await Promise.all(resultPromises);

        // NOW FOR ROUND 2

        const resultPromises2 = [];

        for (let i = 0; i < 4; i++) {
            const a = i;
            resultPromises2.push(getQuote({
                authConfigFileLocation: testauthpath,
                symbol: symbols[a],
                queueSettings: {
                    enqueue: true,
                    cbPre: () => recordTime(timeArray, a),
                },
            }));
        }

        const results = await Promise.all(resultPromises2);
        expect(results.length).toBe(resultPromises2.length);
        results.forEach((r: IQuoteResult, idx: number) => expect(r[symbols[idx]].symbol).toBe(symbols[idx]));
        expect(timeArray.length).toBe(results.length);
        for (let i = 0; i < timeArray.length; i++) {
            expect(timeArray[i].position).toBe(i);
            if (i > 0) {
                expect(timeArray[i].time - timeArray[i-1].time).toBeGreaterThanOrEqual(.95*timeDiff);
            }
        }
    });

    test("queue works again after clearing", async () => {
        expect(testAuthConfig).toBeTruthy();
        const timeDiff = 3000;
        tdaRestQueue.setRestQueueSpacing(timeDiff);
        expect(tdaRestQueue.getRestQueueSpacing()).toBe(timeDiff);

        const timeArray: TimeRecord[] = [];
        const symbols = ["MSFT", "AAPL", "TSLA", "IBM"];
        const resultPromises = [];

        for (let i = 0; i < 4; i++) {
            const a = i;
            resultPromises.push(getQuote({
                authConfigFileLocation: testauthpath,
                symbol: symbols[a],
                queueSettings: {
                    enqueue: true,
                },
            }));
        }

        const queueInfoPre: IQueuedRequest[] = tdaRestQueue.getRestQueueInfo();
        tdaRestQueue.clearRestQueue();
        const queueInfoPost: IQueuedRequest[] = tdaRestQueue.getRestQueueInfo();

        try {
            expect(queueInfoPre.length).toBe(3);
        } catch (e) {
            expect(queueInfoPre).toBe({});
        }
        expect(queueInfoPost.length).toBe(0);

        const newTimeDiff = 1000;
        tdaRestQueue.setRestQueueSpacing(newTimeDiff);
        expect(tdaRestQueue.getRestQueueSpacing()).toBe(newTimeDiff);

        const resultPromises2 = [];

        for (let i = 0; i < 4; i++) {
            const a = i;
            resultPromises2.push(getQuote({
                authConfigFileLocation: testauthpath,
                symbol: symbols[a],
                queueSettings: {
                    enqueue: true,
                    cbPre: () => recordTime(timeArray, a),
                },
            }));
        }

        const results = await Promise.all(resultPromises2);
        expect(results.length).toBe(resultPromises2.length);
        results.forEach((r: IQuoteResult, idx: number) => expect(r[symbols[idx]].symbol).toBe(symbols[idx]));
        expect(timeArray.length).toBe(results.length);
        for (let i = 0; i < timeArray.length; i++) {
            expect(timeArray[i].position).toBe(i);
            if (i > 0) {
                expect(timeArray[i].time - timeArray[i-1].time).toBeGreaterThanOrEqual(.95*newTimeDiff);
            }
        }
    });
});
