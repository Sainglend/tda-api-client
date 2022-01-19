import {
    IChartHistoryFuturesGetConfig,
    IGenericStreamConfig,
    IStreamDataTDAConfig,
    StreamDataTDA,
} from "./streamDataTDA";
import authConfig from "./test_tdaclientauth.json";
import {
    AcctActivity,
    AcctActivityRough,
    ChartHistoryFutures,
    ChartHistoryFuturesRough, EAcctActivityMsgType,
    EAdminResponseCode,
    EChartHistoryFuturesFrequency,
    ECommands,
    EQosLevels, ChartEquityResponse, ChartEquityResponseRough,
    EServices, ChartFuturesResponseRough,
    ILoginLogoutResponse,
    IStreamNotify,
    IStreamResponse,
    L1EquityQuote,
    L1EquityQuoteRough,
    L1ForexQuote,
    L1ForexQuoteRough, L1FuturesOptionsQuote, L1FuturesOptionsQuoteRough,
    L1FuturesQuote,
    L1FuturesQuoteRough, L1OptionsQuote, L1OptionsQuoteRough, NewsHeadline, NewsHeadlineRough,
} from "./streamingdatatypes";
import { normalizeSymbol } from "./streamingutils";
import {IWriteResponse, TacRequestConfig} from "./tdapiinterface";
import {getAccounts} from "./accounts";
import path from "path";
import {
    cancelOrder,
    generateBuyLimitEquityOrder,
    IPlaceOrderConfig,
    placeOrder,
} from "./orders";

jest.setTimeout(30000);

const testauthpath = path.join(__dirname, "test_tdaclientauth.json");
const baseStreamConfig: IStreamDataTDAConfig = {
    authConfig,
    // verbose: false,
    // debug: true,
};

function todayMidnight(): Date {
    return new Date(`${new Date().toISOString().substring(0, 10)}T00:00:00.000Z`);
}

function getFridaysDate(from: Date = todayMidnight()): Date {
    if (from.getDay() <= 4) {
        return new Date(from.getTime() + ((4 - from.getDay()) * 24 * 3600 * 1000));
    } else if (from.getDay() == 5) {
        return new Date(from.getTime() + (6 * 24 * 3600 * 1000));
    } else {
        return new Date(from.getTime() + (5 * 24 * 3600 * 1000));
    }
}

function formatDateMMDDYY(date: Date): string {
    const ds = date.toISOString().substring(0, 10);
    return `${ds.substring(5,7)}${ds.substring(8,10)}${ds.substring(2,4)}`;
}

async function doStreamSetup() {
    const tdaDataStream = new StreamDataTDA({
        ...baseStreamConfig,
        verbose: true,
        debug: true,
        emitDataRaw: true,
        emitDataBySubRaw: true,
        emitDataBySubAndTickerRaw: true,
        emitDataBySubTyped: true,
        emitDataBySubAndTickerTyped: true,
    });

    await new Promise(res => {
        tdaDataStream.once("response", () => {
            res("");
        });

        tdaDataStream.doDataStreamLogin();
    });

    return tdaDataStream;
}

async function doStreamTeardown(stream: StreamDataTDA): Promise<void> {
    const closingPromise = new Promise<void>((res) => {
        stream.on("streamClosed", (data: any) => {
            if (!data.attemptingReconnect) res();
        });
    });
    await stream.doDataStreamLogout();
    await closingPromise;
}

describe("streaming", () => {
    let accountId = "";
    const baseConfig: TacRequestConfig = {
        verbose: false,
        authConfigFileLocation: testauthpath,
    };

    beforeAll(async () => {
        // first find an account for placing the order
        const accounts = await getAccounts({
            ...baseConfig,
        });
        accountId = accounts[0].securitiesAccount.accountId;
    });

    beforeEach(async () => {
        // use this to avoid rate restrictions during testing
        await new Promise<void>((res) => {
            setTimeout(res, 2000);
        });
    });

    describe("ADMIN functions and heartbeat", () => {
        beforeEach(async () => {
            // use this to avoid rate restrictions during testing
            await new Promise<void>((res) => {
                setTimeout(res, 2000);
            });
        });

        // heartbeat, response, data, snapshot, streamClosed
        test("subscribe to stream and get the login response", async () => {
            const tdaDataStream = new StreamDataTDA({...baseStreamConfig});
            const loginResponse: IStreamResponse[] = await new Promise((res) => {
                tdaDataStream.once("response", (data: IStreamResponse[]) => {
                    res(data);
                });

                tdaDataStream.doDataStreamLogin();
            });
            expect(loginResponse).toBeTruthy();
            expect(loginResponse[0].service).toBe(EServices.ADMIN);
            expect(loginResponse[0].command).toBe(ECommands.LOGIN);
            expect((loginResponse[0].content as ILoginLogoutResponse).code).toBe(EAdminResponseCode.SUCCESS);

            await doStreamTeardown(tdaDataStream);
        });

        test("subscribe to stream and get a heartbeat", async () => {
            const tdaDataStream = new StreamDataTDA({...baseStreamConfig});
            const hbResponse: IStreamNotify[] = await new Promise((res) => {
                tdaDataStream.once("heartbeat", (data: IStreamNotify[]) => {
                    res(data);
                });

                tdaDataStream.doDataStreamLogin();
            });
            expect(hbResponse).toBeTruthy();
            expect(hbResponse[0].heartbeat).toBeTruthy();

            await doStreamTeardown(tdaDataStream);
        });

        test("subscribe to stream, logout, and get the logout response", async () => {
            const tdaDataStream = new StreamDataTDA({...baseStreamConfig});

            await new Promise((res) => {
                tdaDataStream.once("response", (data: IStreamResponse[]) => {
                    res(data);
                });
                tdaDataStream.doDataStreamLogin();
            });

            const logoutPromise = new Promise<IStreamResponse[]>((res) => {
                tdaDataStream.on("response", (data: IStreamResponse[]) => {
                    if (data.some(r => r.command === ECommands.LOGOUT)) {
                        res(data);
                    }
                });
            });
            setTimeout(() => tdaDataStream.doDataStreamLogout(), 2000);

            const logoutResponse = await logoutPromise;
            tdaDataStream.removeAllListeners("response");
            expect(logoutResponse).toBeTruthy();
            expect(logoutResponse[0].service).toBe(EServices.ADMIN);
            expect(logoutResponse[0].command).toBe(ECommands.LOGOUT);
            expect((logoutResponse[0].content as ILoginLogoutResponse).code).toBe(EAdminResponseCode.SUCCESS);
            expect((logoutResponse[0].content as ILoginLogoutResponse).msg).toBe("SUCCESS");
        });

        test("logging out emits streamClosed", async () => {
            const tdaDataStream = new StreamDataTDA({...baseStreamConfig});

            await new Promise((res) => {
                tdaDataStream.once("response", (data: IStreamResponse[]) => {
                    res(data);
                });
                tdaDataStream.doDataStreamLogin();
            });

            const streamClosedPromise = new Promise<IStreamResponse[]>((res) => {
                tdaDataStream.once("streamClosed", (data: any) => {
                    res(data);
                });
            });
            setTimeout(() => tdaDataStream.doDataStreamLogout(), 2000);

            const streamClosedEmit: any = await streamClosedPromise;
            expect(streamClosedEmit).toBeTruthy();
            expect(streamClosedEmit.attemptingReconnect).toBe(false);
        });

        test("QOS change works as expected", async () => {
            const targetQoSLevel = EQosLevels.L3_MODERATE_1500MS;
            const tdaDataStream = new StreamDataTDA({...baseStreamConfig});

            await new Promise((res) => {
                tdaDataStream.once("response", (data: IStreamResponse[]) => {
                    res(data);
                });
                tdaDataStream.doDataStreamLogin();
            });

            const qosChangedPromise = new Promise<IStreamResponse[]>((res) => {
                tdaDataStream.on("response", (data: IStreamResponse[]) => {
                    if(data[0].command === ECommands.QOS) res(data);
                });
            });
            setTimeout(() => tdaDataStream.qosRequest({ qosLevel: targetQoSLevel }), 2000);

            const qosResponse = await qosChangedPromise;
            tdaDataStream.removeAllListeners("response");
            expect(qosResponse).toBeTruthy();
            expect(qosResponse[0].service).toBe(EServices.ADMIN);
            expect(qosResponse[0].command).toBe(ECommands.QOS);
            expect((qosResponse[0].content as ILoginLogoutResponse).code).toBe(EAdminResponseCode.SUCCESS);
            expect((qosResponse[0].content as ILoginLogoutResponse).msg).toBe(`QoS command succeeded. Set qoslevel=${targetQoSLevel}`);
        });
    });

    describe("open stream functionality", () => {
        describe("SNAPSHOT data functions", () => {
            beforeEach(async () => {
                // use this to avoid rate restrictions during testing
                await new Promise<void>((res) => {
                    setTimeout(res, 2000);
                });
            });

            test("CHART_HISTORY_FUTURES", async () => {
                const tdaDataStream = await doStreamSetup();
                const service = EServices.CHART_HISTORY_FUTURES;
                const symbol = "/ES";
                const normalizedSymbol = normalizeSymbol(symbol);

                const promises = [
                    new Promise((res) =>
                        tdaDataStream.on(`snapshot`, (data: IStreamResponse) => res(data))),
                    new Promise((res) =>
                        tdaDataStream.on(`${service}_RAW`, (data: any) => res(data))),
                    new Promise((res) =>
                        tdaDataStream.on(`${service}_RAW_${normalizedSymbol}`, (data: any) => res(data))),
                    new Promise((res) =>
                        tdaDataStream.on(`${service}_TYPED`, (data: any) => res(data))),
                    new Promise((res) =>
                        tdaDataStream.on(`${service}_TYPED_${normalizedSymbol}`, (data: any) => res(data))),
                ];

                const futuresGetConfig: IChartHistoryFuturesGetConfig = {
                    symbol: "/ES",
                    frequency: EChartHistoryFuturesFrequency.MINUTE_THIRTY,
                    period: "d5",
                };
                tdaDataStream.chartHistoryFuturesGet(futuresGetConfig);

                const tuple = await Promise.all(promises) as [
                    IStreamResponse[],
                    ChartHistoryFuturesRough[],
                    ChartHistoryFuturesRough,
                    ChartHistoryFutures[],
                    ChartHistoryFutures
                ];
                const [raw, subRaw, subTickerRaw, subTyped, subTickerTyped] = tuple;

                expect(raw).toBeTruthy();
                expect(raw[0].command).toBe(ECommands.GET);
                expect(raw[0].service).toBe(service);
                const rawData = raw[0].content[0];
                expect(rawData.key).toBe(symbol);
                // length of candles array
                expect(rawData["2"]).toBe(rawData["3"].length);

                expect(subRaw).toBeTruthy();
                const subRawData = subRaw[0];
                expect(subRawData.key).toBe(symbol);
                expect(subRawData["2"]).toBe(subRawData["3"].length);

                expect(subTickerRaw).toBeTruthy();
                expect(subTickerRaw.key).toBe(symbol);
                expect(subTickerRaw["2"]).toBe(subTickerRaw["3"].length);

                expect(subTyped).toBeTruthy();
                expect(subTyped[0].key).toBe(symbol);
                expect(subTyped[0].count).toBe(subTyped[0].candles.length);

                expect(subTickerTyped).toBeTruthy();
                expect(subTickerTyped.key).toBe(symbol);
                expect(subTickerTyped.count).toBe(subTickerTyped.candles.length);

                await doStreamTeardown(tdaDataStream);
            });

            /**
             * This appears not to work at all
             */
            test.skip("NEWS_HEADLINE_LIST", async () => {
                const tdaDataStream = await doStreamSetup();
                const service = EServices.NEWS_HEADLINE_LIST;
                const symbol = "MSFT";
                const normalizedSymbol = normalizeSymbol(symbol);

                const promises = [
                    new Promise((res) =>
                        tdaDataStream.on(`snapshot`, (data: IStreamResponse) => res(data))),
                    new Promise((res) =>
                        tdaDataStream.on(`${service}_RAW`, (data: any) => res(data))),
                    new Promise((res) =>
                        tdaDataStream.on(`${service}_RAW_${normalizedSymbol}`, (data: any) => res(data))),
                    new Promise((res) =>
                        tdaDataStream.on(`${service}_TYPED`, (data: any) => res(data))),
                    new Promise((res) =>
                        tdaDataStream.on(`${service}_TYPED_${normalizedSymbol}`, (data: any) => res(data))),
                ];

                const config: IGenericStreamConfig = {
                    parameters: {
                        keys: symbol,
                    },
                    service: EServices.NEWS_HEADLINE_LIST,
                    command: ECommands.GET,
                };
                tdaDataStream.genericStreamRequest(config);

                const tuple = await Promise.all(promises) as [
                    IStreamResponse[],
                    ChartHistoryFuturesRough[],
                    ChartHistoryFuturesRough,
                    ChartHistoryFutures[],
                    ChartHistoryFutures
                ];
                const [raw, subRaw, subTickerRaw, subTyped, subTickerTyped] = tuple;

                expect(raw).toBeTruthy();
                expect(raw[0].command).toBe(ECommands.GET);
                expect(raw[0].service).toBe(service);

                expect(subRaw).toBeTruthy();

                expect(subTickerRaw).toBeTruthy();

                expect(subTyped).toBeTruthy();

                expect(subTickerTyped).toBeTruthy();
                await doStreamTeardown(tdaDataStream);
            });
        });

        describe("DATA stream - unrecognized symbol responses", () => {

            // no result if wrong symbol for:
            // QUOTE
            // CHART_EQUITY
            // CHART_FUTURES
            test("LEVELONE_FUTURES_OPTIONS", async () => {
                const tdaDataStream = await doStreamSetup();
                const service = EServices.LEVELONE_FUTURES_OPTIONS;
                // unknown symbol
                const symbol1 = "yourmom";

                const promises = await genericDataStreamPart1(tdaDataStream, service, symbol1);

                const tuple = await Promise.all(promises) as [
                    IStreamResponse[],
                    IStreamResponse[],
                    L1FuturesOptionsQuoteRough[],
                    L1FuturesOptionsQuoteRough,
                    L1FuturesOptionsQuote[],
                    L1FuturesOptionsQuote
                ];
                const [response, raw, subRaw, subTickerRaw, subTyped, subTickerTyped] = tuple;

                expect(response).toBeTruthy();
                expect(response[0].command).toBe(ECommands.SUBS);
                expect(response[0].service).toBe(service);
                expect(response[0].content.code).toBe(EAdminResponseCode.SUCCESS);
                expect(response[0].content.msg).toBe("SUBS command succeeded");

                expect(raw).toBeTruthy();
                expect(raw[0].command).toBe(ECommands.SUBS);
                expect(raw[0].service).toBe(service);

                expect(subRaw).toBeTruthy();
                expect(subRaw[0].key).toBe(symbol1);
                // strike
                expect(subRaw[0]["25"]).toBeUndefined();

                expect(subTickerRaw).toBeTruthy();
                expect(subTickerRaw.key).toBe(symbol1);
                // strike
                expect(subTickerRaw["25"]).toBeUndefined();

                expect(subTyped).toBeTruthy();
                expect(subTyped[0].symbol).toBe(symbol1);
                expect(subTyped[0].strike).toBeUndefined();

                expect(subTickerTyped).toBeTruthy();
                expect(subTickerTyped.symbol).toBe(symbol1);
                expect(subTickerTyped.strike).toBeUndefined();

                const configEnd: IGenericStreamConfig = {
                    service,
                    command: ECommands.UNSUBS,
                };
                await tdaDataStream.genericStreamRequest(configEnd);
                await doStreamTeardown(tdaDataStream);
            });
        });

        describe("DATA stream responses", () => {
            beforeEach(async () => {
                // use this to avoid rate restrictions during testing
                await new Promise<void>((res) => {
                    setTimeout(res, 5000);
                });
            });

            test("QUOTE", async () => {
                const tdaDataStream = await doStreamSetup();
                const service = EServices.QUOTE;
                const symbol1 = "MSFT";
                const symbol2 = "AAPL";

                // set up promises, send initial SUBS command
                const promises = await genericDataStreamPart1(tdaDataStream, service, symbol1);
                const tuple = await Promise.all(promises) as [
                    IStreamResponse[],
                    IStreamResponse[],
                    L1EquityQuoteRough[],
                    L1EquityQuoteRough,
                    L1EquityQuote[],
                    L1EquityQuote
                ];
                const [response, raw, subRaw, subTickerRaw, subTyped, subTickerTyped] = tuple;

                expect(response).toBeTruthy();
                expect(response[0].command).toBe(ECommands.SUBS);
                expect(response[0].service).toBe(service);
                expect(response[0].content.code).toBe(EAdminResponseCode.SUCCESS);
                expect(response[0].content.msg).toBe("SUBS command succeeded");

                expect(raw).toBeTruthy();
                expect(raw[0].command).toBe(ECommands.SUBS);
                expect(raw[0].service).toBe(service);

                expect(subRaw).toBeTruthy();
                expect(subRaw[0].key).toBe(symbol1);
                // time last quote
                expect(subRaw[0]["50"]).toBeTruthy();

                expect(subTickerRaw).toBeTruthy();
                expect(subTickerRaw.key).toBe(symbol1);
                // time last quote
                expect(subTickerRaw["50"]).toBeTruthy();

                expect(subTyped).toBeTruthy();
                expect(subTyped[0].symbol).toBe(symbol1);
                expect(subTyped[0].timestamp).toBeTruthy();
                expect(subTyped[0].timeLastQuote).toBeTruthy();

                expect(subTickerTyped).toBeTruthy();
                expect(subTickerTyped.symbol).toBe(symbol1);
                expect(subTickerTyped.timestamp).toBeTruthy();
                expect(subTickerTyped.timeLastQuote).toBeTruthy();

                // ADD, UNSUBS one, UNSUBS all
                await genericDataStreamPart2(tdaDataStream, service, symbol2);
                await doStreamTeardown(tdaDataStream);
            });

            test("LEVELONE_FUTURES", async () => {
                const tdaDataStream = await doStreamSetup();
                const service = EServices.LEVELONE_FUTURES;
                const symbol1 = "/ES";
                const symbol2 = "/NQ";

                const promises = await genericDataStreamPart1(tdaDataStream, service, symbol1);

                const tuple = await Promise.all(promises) as [
                    IStreamResponse[],
                    IStreamResponse[],
                    L1FuturesQuoteRough[],
                    L1FuturesQuoteRough,
                    L1FuturesQuote[],
                    L1FuturesQuote
                ];
                const [response, raw, subRaw, subTickerRaw, subTyped, subTickerTyped] = tuple;

                expect(response).toBeTruthy();
                expect(response[0].command).toBe(ECommands.SUBS);
                expect(response[0].service).toBe(service);
                expect(response[0].content.code).toBe(EAdminResponseCode.SUCCESS);
                expect(response[0].content.msg).toBe("SUBS command succeeded");

                expect(raw).toBeTruthy();
                expect(raw[0].command).toBe(ECommands.SUBS);
                expect(raw[0].service).toBe(service);

                expect(subRaw).toBeTruthy();
                expect(subRaw[0].key).toBe(symbol1);
                // time last quote
                expect(subRaw[0]["10"]).toBeTruthy();

                expect(subTickerRaw).toBeTruthy();
                expect(subTickerRaw.key).toBe(symbol1);
                expect(subTickerRaw["10"]).toBeTruthy();

                expect(subTyped).toBeTruthy();
                expect(subTyped[0].symbol).toBe(symbol1);
                expect(subTyped[0].timestamp).toBeTruthy();
                expect(subTyped[0].timeLastQuote).toBeTruthy();

                expect(subTickerTyped).toBeTruthy();
                expect(subTickerTyped.symbol).toBe(symbol1);
                expect(subTickerTyped.timestamp).toBeTruthy();
                expect(subTickerTyped.timeLastQuote).toBeTruthy();

                await genericDataStreamPart2(tdaDataStream, service, symbol2);
                await doStreamTeardown(tdaDataStream);
            });

            test("LEVELONE_FOREX", async () => {
                const tdaDataStream = await doStreamSetup();
                const service = EServices.LEVELONE_FOREX;
                const symbol1 = "EUR/USD";
                const symbol2 = "USD/JPY";

                const promises = await genericDataStreamPart1(tdaDataStream, service, symbol1);

                const tuple = await Promise.all(promises) as [
                    IStreamResponse[],
                    IStreamResponse[],
                    L1ForexQuoteRough[],
                    L1ForexQuoteRough,
                    L1ForexQuote[],
                    L1ForexQuote
                ];
                const [response, raw, subRaw, subTickerRaw, subTyped, subTickerTyped] = tuple;

                expect(response).toBeTruthy();
                expect(response[0].command).toBe(ECommands.SUBS);
                expect(response[0].service).toBe(service);
                expect(response[0].content.code).toBe(EAdminResponseCode.SUCCESS);
                expect(response[0].content.msg).toBe("SUBS command succeeded");

                expect(raw).toBeTruthy();
                expect(raw[0].command).toBe(ECommands.SUBS);
                expect(raw[0].service).toBe(service);

                expect(subRaw).toBeTruthy();
                expect(subRaw[0].key).toBe(symbol1);
                // time last quote
                expect(subRaw[0]["8"]).toBeTruthy();

                expect(subTickerRaw).toBeTruthy();
                expect(subTickerRaw.key).toBe(symbol1);
                // time last quote
                expect(subTickerRaw["8"]).toBeTruthy();

                expect(subTyped).toBeTruthy();
                expect(subTyped[0].symbol).toBe(symbol1);
                expect(subTyped[0].timestamp).toBeTruthy();
                expect(subTyped[0].timeLastQuote).toBeTruthy();

                expect(subTickerTyped).toBeTruthy();
                expect(subTickerTyped.symbol).toBe(symbol1);
                expect(subTickerTyped.timestamp).toBeTruthy();
                expect(subTickerTyped.timeLastQuote).toBeTruthy();

                await genericDataStreamPart2(tdaDataStream, service, symbol2);
                await doStreamTeardown(tdaDataStream);
            });

            test("OPTION", async () => {
                const tdaDataStream = await doStreamSetup();
                const service = EServices.OPTION;
                // SPY C400 expiring this friday and next friday; always liquid
                const symbol1 = `SPY_${formatDateMMDDYY(getFridaysDate())}C400`;
                const symbol2 = `SPY_${formatDateMMDDYY(getFridaysDate(new Date(todayMidnight().getTime() + 7*24*3600*1000)))}C400`;

                const promises = await genericDataStreamPart1(tdaDataStream, service, symbol1);

                const tuple = await Promise.all(promises) as [
                    IStreamResponse[],
                    IStreamResponse[],
                    L1OptionsQuoteRough[],
                    L1OptionsQuoteRough,
                    L1OptionsQuote[],
                    L1OptionsQuote
                ];
                const [response, raw, subRaw, subTickerRaw, subTyped, subTickerTyped] = tuple;

                expect(response).toBeTruthy();
                expect(response[0].command).toBe(ECommands.SUBS);
                expect(response[0].service).toBe(service);
                expect(response[0].content.code).toBe(EAdminResponseCode.SUCCESS);
                expect(response[0].content.msg).toBe("SUBS command succeeded");

                expect(raw).toBeTruthy();
                expect(raw[0].command).toBe(ECommands.SUBS);
                expect(raw[0].service).toBe(service);

                expect(subRaw).toBeTruthy();
                expect(subRaw[0].key).toBe(symbol1);
                // openInterest
                expect(subRaw[0]["9"]).toBeGreaterThanOrEqual(0);

                expect(subTickerRaw).toBeTruthy();
                expect(subTickerRaw.key).toBe(symbol1);
                // openInterest
                expect(subTickerRaw["9"]).toBeGreaterThanOrEqual(0);

                expect(subTyped).toBeTruthy();
                expect(subTyped[0].symbol).toBe(symbol1);
                expect(subTyped[0].openInterest).toBeGreaterThanOrEqual(0);

                expect(subTickerTyped).toBeTruthy();
                expect(subTickerTyped.symbol).toBe(symbol1);
                expect(subTickerTyped.openInterest).toBeGreaterThanOrEqual(0);

                await genericDataStreamPart2(tdaDataStream, service, symbol2);
                await doStreamTeardown(tdaDataStream);
            });

            test("LEVELONE_FUTURES_OPTIONS", async () => {
                const tdaDataStream = await doStreamSetup();
                const service = EServices.LEVELONE_FUTURES_OPTIONS;
                // SPY C400 expiring this friday and next friday; always liquid
                const symbol1 = `./ESH${new Date().getFullYear()-2000}P4750`;
                const symbol2 = `./NQH${new Date().getFullYear()-2000}C16770`;

                const promises = await genericDataStreamPart1(tdaDataStream, service, symbol1);

                const tuple = await Promise.all(promises) as [
                    IStreamResponse[],
                    IStreamResponse[],
                    L1FuturesOptionsQuoteRough[],
                    L1FuturesOptionsQuoteRough,
                    L1FuturesOptionsQuote[],
                    L1FuturesOptionsQuote
                ];
                const [response, raw, subRaw, subTickerRaw, subTyped, subTickerTyped] = tuple;

                expect(response).toBeTruthy();
                expect(response[0].command).toBe(ECommands.SUBS);
                expect(response[0].service).toBe(service);
                expect(response[0].content.code).toBe(EAdminResponseCode.SUCCESS);
                expect(response[0].content.msg).toBe("SUBS command succeeded");

                expect(raw).toBeTruthy();
                expect(raw[0].command).toBe(ECommands.SUBS);
                expect(raw[0].service).toBe(service);

                expect(subRaw).toBeTruthy();
                expect(subRaw[0].key).toBe(symbol1);
                // strike
                expect(subRaw[0]["25"]).toBeTruthy();

                expect(subTickerRaw).toBeTruthy();
                expect(subTickerRaw.key).toBe(symbol1);
                // strike
                expect(subTickerRaw["25"]).toBeTruthy();

                expect(subTyped).toBeTruthy();
                expect(subTyped[0].symbol).toBe(symbol1);
                expect(subTyped[0].strike).toBeTruthy();

                expect(subTickerTyped).toBeTruthy();
                expect(subTickerTyped.symbol).toBe(symbol1);
                expect(subTickerTyped.strike).toBeTruthy();

                await genericDataStreamPart2(tdaDataStream, service, symbol2);
                await doStreamTeardown(tdaDataStream);
            });

            test("CHART_EQUITY", async () => {
                const tdaDataStream = await doStreamSetup();
                const service = EServices.CHART_EQUITY;
                // SPY C400 expiring this friday and next friday; always liquid
                const symbol1 = `MSFT`;
                const symbol2 = `TSLA`;

                const promises = await genericDataStreamPart1(tdaDataStream, service, symbol1);

                const tuple = await Promise.all(promises) as [
                    IStreamResponse[],
                    IStreamResponse[],
                    ChartEquityResponseRough[],
                    ChartEquityResponseRough,
                    ChartEquityResponse[],
                    ChartEquityResponse
                ];
                const [response, raw, subRaw, subTickerRaw, subTyped, subTickerTyped] = tuple;

                expect(response).toBeTruthy();
                expect(response[0].command).toBe(ECommands.SUBS);
                expect(response[0].service).toBe(service);
                expect(response[0].content.code).toBe(EAdminResponseCode.SUCCESS);
                expect(response[0].content.msg).toBe("SUBS command succeeded");

                expect(raw).toBeTruthy();
                expect(raw[0].command).toBe(ECommands.SUBS);
                expect(raw[0].service).toBe(service);

                expect(subRaw).toBeTruthy();
                expect(subRaw[0].key).toBe(symbol1);
                // strike
                expect(subRaw[0].seq).toBeTruthy();

                expect(subTickerRaw).toBeTruthy();
                expect(subTickerRaw.key).toBe(symbol1);
                // strike
                expect(subTickerRaw.seq).toBeTruthy();

                expect(subTyped).toBeTruthy();
                expect(subTyped[0].symbol).toBe(symbol1);
                expect(subTyped[0].seq).toBeTruthy();

                expect(subTickerTyped).toBeTruthy();
                expect(subTickerTyped.symbol).toBe(symbol1);
                expect(subTickerTyped.seq).toBeTruthy();

                await genericDataStreamPart2(tdaDataStream, service, symbol2);
                await doStreamTeardown(tdaDataStream);
            });

            test("CHART_FUTURES", async () => {
                const tdaDataStream = await doStreamSetup();
                const service = EServices.CHART_FUTURES;
                // SPY C400 expiring this friday and next friday; always liquid
                const symbol1 = `/ES`;
                const symbol2 = `/NQ`;

                const promises = await genericDataStreamPart1(tdaDataStream, service, symbol1);

                const tuple = await Promise.all(promises) as [
                    IStreamResponse[],
                    IStreamResponse[],
                    ChartFuturesResponseRough[],
                    ChartFuturesResponseRough,
                    ChartEquityResponse[],
                    ChartEquityResponse
                ];
                const [response, raw, subRaw, subTickerRaw, subTyped, subTickerTyped] = tuple;

                expect(response).toBeTruthy();
                expect(response[0].command).toBe(ECommands.SUBS);
                expect(response[0].service).toBe(service);
                expect(response[0].content.code).toBe(EAdminResponseCode.SUCCESS);
                expect(response[0].content.msg).toBe("SUBS command succeeded");

                expect(raw).toBeTruthy();
                expect(raw[0].command).toBe(ECommands.SUBS);
                expect(raw[0].service).toBe(service);

                expect(subRaw).toBeTruthy();
                expect(subRaw[0].key).toBe(symbol1);
                // strike
                expect(subRaw[0].seq).toBeTruthy();

                expect(subTickerRaw).toBeTruthy();
                expect(subTickerRaw.key).toBe(symbol1);
                // strike
                expect(subTickerRaw.seq).toBeTruthy();

                expect(subTyped).toBeTruthy();
                expect(subTyped[0].symbol).toBe(symbol1);
                expect(subTyped[0].seq).toBeTruthy();

                expect(subTickerTyped).toBeTruthy();
                expect(subTickerTyped.symbol).toBe(symbol1);
                expect(subTickerTyped.seq).toBeTruthy();

                await genericDataStreamPart2(tdaDataStream, service, symbol2);
                await doStreamTeardown(tdaDataStream);
            });

            test("NEWS_HEADLINE", async () => {
                const tdaDataStream = await doStreamSetup();
                const service = EServices.NEWS_HEADLINE;
                // SPY C400 expiring this friday and next friday; always liquid
                const symbol1 = `TSLA`;
                const symbol2 = `MSFT`;

                const promises = await genericDataStreamPart1(tdaDataStream, service, symbol1);

                const tuple = await Promise.all(promises) as [
                    IStreamResponse[],
                    IStreamResponse[],
                    NewsHeadlineRough[],
                    NewsHeadlineRough,
                    NewsHeadline[],
                    NewsHeadline
                ];
                const [response, raw, subRaw, subTickerRaw, subTyped, subTickerTyped] = tuple;

                expect(response).toBeTruthy();
                expect(response[0].command).toBe(ECommands.SUBS);
                expect(response[0].service).toBe(service);
                expect(response[0].content.code).toBe(EAdminResponseCode.SUCCESS);
                expect(response[0].content.msg).toBe("SUBS command succeeded");

                expect(raw).toBeTruthy();
                expect(raw[0].command).toBe(ECommands.SUBS);
                expect(raw[0].service).toBe(service);

                expect(subRaw).toBeTruthy();
                expect(subRaw[0].key).toBe(symbol1);
                // strike
                expect(subRaw[0].seq).toBeTruthy();

                expect(subTickerRaw).toBeTruthy();
                expect(subTickerRaw.key).toBe(symbol1);
                // strike
                expect(subTickerRaw.seq).toBeTruthy();

                expect(subTyped).toBeTruthy();
                expect(subTyped[0].symbol).toBe(symbol1);
                expect(subTyped[0].seq).toBeTruthy();

                expect(subTickerTyped).toBeTruthy();
                expect(subTickerTyped.symbol).toBe(symbol1);
                expect(subTickerTyped.seq).toBeTruthy();

                await genericDataStreamPart2(tdaDataStream, service, symbol2);
                await doStreamTeardown(tdaDataStream);
            });

            test("ACCT_ACTIVITY", async () => {
                const tdaDataStream = await doStreamSetup();
                const service = EServices.ACCT_ACTIVITY;

                const promises = [
                    new Promise((res) =>
                        tdaDataStream.once(`response`, (data: IStreamResponse[]) => {
                            if (data[0].service === service) res(data);
                        })),
                    new Promise((res) =>
                        tdaDataStream.once(`data`, (data: IStreamResponse[]) => {
                            if (data[0].service === service) res(data);
                        })),
                    new Promise((res) =>
                        tdaDataStream.once(`${service}_RAW`, (data: any) => res(data))),
                    new Promise((res) =>
                        tdaDataStream.once(`${service}_TYPED`, (data: any) => res(data))),
                ];

                tdaDataStream.accountActivitySub();

                const tuple = await Promise.all(promises) as [
                    IStreamResponse[],
                    IStreamResponse[],
                    AcctActivityRough[],
                    AcctActivity[],
                ];
                const [response, raw, subRaw, subTyped] = tuple;

                expect(response).toBeTruthy();
                expect(response[0].command).toBe(ECommands.SUBS);
                expect(response[0].service).toBe(service);
                expect(response[0].content.code).toBe(EAdminResponseCode.SUCCESS);
                expect(response[0].content.msg).toBe("SUBS command succeeded");

                expect(raw).toBeTruthy();
                expect(raw[0].command).toBe(ECommands.SUBS);
                expect(raw[0].service).toBe(service);

                expect(subRaw).toBeTruthy();
                // expect(subRaw[0].key).toBe("");
                // strike
                expect(subRaw[0]["2"]).toBe("SUBSCRIBED");

                expect(subTyped).toBeTruthy();
                // expect(subTyped[0].symbol).toBe("");
                expect(subTyped[0].messageType).toBe("SUBSCRIBED");


                // now place an order and wait for the account sub data
                const orderPromises = [
                    new Promise((res) =>
                        tdaDataStream.once(`data`, (data: IStreamResponse[]) => {
                            if (data[0].service === service) res(data);
                        })),
                    new Promise((res) =>
                        tdaDataStream.once(`${service}_RAW`, (data: any) => res(data))),
                    new Promise((res) =>
                        tdaDataStream.once(`${service}_TYPED`, (data: any) => res(data))),
                ];



                expect(baseConfig.authConfigFileLocation).toBeTruthy();

                // place an order
                const config: IPlaceOrderConfig = {
                    accountId: accountId,
                    orderJSON: generateBuyLimitEquityOrder({ symbol: "F", price: 2.50, quantity: 1 }),
                    ...baseConfig,
                };
                const result: IWriteResponse = await placeOrder(config);
                expect(result).toBeTruthy();
                expect(result.location).toBeTruthy();
                const orderId: string = result.location.substring(result.location.lastIndexOf("/") + 1);

                const orderTuple = await Promise.all(orderPromises) as [
                    IStreamResponse[],
                    AcctActivityRough[],
                    AcctActivity[],
                ];
                const [orderRaw, orderSubRaw, orderSubTyped] = orderTuple;
                expect(orderRaw).toBeTruthy();
                expect(orderRaw[0].content[0]["1"]).toBe(accountId);
                expect(orderRaw[0].content[0]["2"]).toBe(EAcctActivityMsgType.OrderEntryRequest);

                expect(orderSubRaw).toBeTruthy();
                expect(orderSubRaw[0]["1"]).toBe(accountId);
                expect(orderSubRaw[0]["2"]).toBe(EAcctActivityMsgType.OrderEntryRequest);

                expect(orderSubTyped).toBeTruthy();
                expect(orderSubTyped[0].accountNumber).toBe(accountId);
                expect(orderSubTyped[0].messageType).toBe(EAcctActivityMsgType.OrderEntryRequest);


                // now place an order and wait for the account sub data
                const cancelOrderPromises = [
                    new Promise((res) =>
                        tdaDataStream.once(`data`, (data: IStreamResponse[]) => {
                            if (data[0].service === service) res(data);
                        })),
                    new Promise((res) =>
                        tdaDataStream.once(`${service}_RAW`, (data: any) => res(data))),
                    new Promise((res) =>
                        tdaDataStream.once(`${service}_TYPED`, (data: any) => res(data))),
                ];

                // cancel the order
                await cancelOrder({
                    accountId,
                    orderId: orderId,
                    ...baseConfig,
                });

                const orderCancelTuple = await Promise.all(cancelOrderPromises) as [
                    IStreamResponse[],
                    AcctActivityRough[],
                    AcctActivity[],
                ];
                const [orderCancelRaw, orderCancelSubRaw, orderCancelSubTyped] = orderCancelTuple;
                expect(orderCancelRaw).toBeTruthy();
                expect(orderCancelRaw[0].content[0]["1"]).toBe(accountId);
                expect(orderCancelRaw[0].content[0]["2"]).toBe(EAcctActivityMsgType.UROUT);

                expect(orderCancelSubRaw).toBeTruthy();
                expect(orderCancelSubRaw[0]["1"]).toBe(accountId);
                expect(orderCancelSubRaw[0]["2"]).toBe(EAcctActivityMsgType.UROUT);

                expect(orderCancelSubTyped).toBeTruthy();
                expect(orderCancelSubTyped[0].accountNumber).toBe(accountId);
                expect(orderCancelSubTyped[0].messageType).toBe(EAcctActivityMsgType.UROUT);

                // close account subs
                await tdaDataStream.accountActivityUnsub();
                await doStreamTeardown(tdaDataStream);
            });
        });

        describe("queue", () => {
            // queueAccountActivitySub
            // queueAccountActivityUnsub
            // queueChartHistoryFuturesGet
            // queueGenericStreamRequest
            // queueQosRequest
            // queueClear
            test("request queue spacing is within expected bounds", async () => {
                const callbackTimes: number[] = [];
                const callback = () => callbackTimes.push(Date.now());

                const symbol1 = "MSFT";
                const symbol2 = "TSLA";

                const subConfig: IGenericStreamConfig = {
                    parameters: {
                        keys: symbol1,
                    },
                    service: EServices.QUOTE,
                    command: ECommands.SUBS,
                };

                const addConfig: IGenericStreamConfig = {
                    parameters: {
                        keys: symbol2,
                    },
                    service: EServices.QUOTE,
                    command: ECommands.ADD,
                };

                const unsubOneConfig: IGenericStreamConfig = {
                    parameters: {
                        keys: symbol2,
                    },
                    service: EServices.QUOTE,
                    command: ECommands.UNSUBS,
                };

                const unsubAllConfig: IGenericStreamConfig = {
                    service: EServices.QUOTE,
                    command: ECommands.UNSUBS,
                };

                const tdaDataStream = await doStreamSetup();
                await tdaDataStream.genericStreamRequest(subConfig,
                    {
                        useQueue: true,
                        callbackPre: callback,
                    });

                for (let i = 0; i < 5; i++) {
                    await tdaDataStream.genericStreamRequest(addConfig, { useQueue: true, callbackPre: callback });
                    await tdaDataStream.genericStreamRequest(unsubOneConfig, { useQueue: true, callbackPre: callback });
                }

                await new Promise<void>(res => {
                    tdaDataStream.genericStreamRequest(unsubAllConfig, {
                        useQueue: true,
                        callbackPre: () => {
                            callback();
                            res();
                        },
                    });
                });

                expect(callbackTimes.length).toBe(12);
                const diffs: number[] = callbackTimes.map((val, idx, arr) => idx > 0 ? val - arr[idx-1] : val).slice(1);
                const streamConfig = tdaDataStream.getConfig();
                expect(diffs.reduce((prev, curr) => Math.min(prev, curr))).toBeGreaterThan(streamConfig.queueConfig?.minimumSpacingMS || Number.MAX_SAFE_INTEGER);
                expect(diffs.reduce((prev, curr) => Math.max(prev, curr))).toBeLessThan(1.1 * (streamConfig.queueConfig?.maximumSpacingMS || 0));
                await doStreamTeardown(tdaDataStream);
            });
        });

        async function genericDataStreamPart1(tdaDataStream: StreamDataTDA, service: EServices, symbol1: string): Promise<Promise<any>[]> {
            const normalizedSymbol1 = normalizeSymbol(symbol1);

            const promises = [
                new Promise((res) =>
                    tdaDataStream.once(`response`, (data: IStreamResponse[]) => {
                        if (data[0].service === service) res(data);
                    })),
                new Promise((res) =>
                    tdaDataStream.once(`data`, (data: IStreamResponse[]) => {
                        if (data[0].service === service) res(data);
                    })),
                new Promise((res) =>
                    tdaDataStream.once(`${service}_RAW`, (data: any) => res(data))),
                new Promise((res) =>
                    tdaDataStream.once(`${service}_RAW_${normalizedSymbol1}`, (data: any) => res(data))),
                new Promise((res) =>
                    tdaDataStream.once(`${service}_TYPED`, (data: any) => res(data))),
                new Promise((res) =>
                    tdaDataStream.once(`${service}_TYPED_${normalizedSymbol1}`, (data: any) => res(data))),
            ];

            const config: IGenericStreamConfig = {
                parameters: {
                    keys: symbol1,
                },
                service,
                command: ECommands.SUBS,
            };
            tdaDataStream.genericStreamRequest(config);

            return promises;
        }

        async function genericDataStreamPart2(tdaDataStream: StreamDataTDA, service: EServices, symbol2: string) {
            // ADD symbol
            const addSubPromise = new Promise<IStreamResponse[]>((res) =>
                tdaDataStream.once(`response`, (data: IStreamResponse[]) => {
                    if (data[0].service === service) res(data);
                }));
            const configAdd: IGenericStreamConfig = {
                service,
                command: ECommands.ADD,
                parameters: {
                    keys: symbol2,
                },
            };
            tdaDataStream.genericStreamRequest(configAdd);
            const addSub: IStreamResponse[] = await addSubPromise;
            expect(addSub[0].command).toBe(ECommands.ADD);
            expect(addSub[0].service).toBe(service);
            expect(addSub[0].content.code).toBe(EAdminResponseCode.SUCCESS);
            expect(addSub[0].content.msg).toBe("ADD command succeeded");


            // UNSUBS single
            const unsubsSinglePromise = new Promise<IStreamResponse[]>((res) =>
                tdaDataStream.once(`response`, (data: IStreamResponse[]) => {
                    if (data[0].service === service) res(data);
                }));
            const configUnsubSingle: IGenericStreamConfig = {
                service,
                command: ECommands.UNSUBS,
                parameters: {
                    keys: symbol2,
                },
            };
            tdaDataStream.genericStreamRequest(configUnsubSingle);
            const unsubSingle: IStreamResponse[] = await unsubsSinglePromise;
            expect(unsubSingle[0].command).toBe(ECommands.UNSUBS);
            expect(unsubSingle[0].service).toBe(service);
            expect(unsubSingle[0].content.code).toBe(EAdminResponseCode.SUCCESS);
            expect(unsubSingle[0].content.msg).toBe("UNSUBS command succeeded");


            // UNSUBS all
            const unsubPromise = new Promise<IStreamResponse[]>((res) =>
                tdaDataStream.once(`response`, (data: IStreamResponse[]) => {
                    if (data[0].service === service) res(data);
                }));
            const configEnd: IGenericStreamConfig = {
                service,
                command: ECommands.UNSUBS,
            };
            tdaDataStream.genericStreamRequest(configEnd);

            const resolvedUnsub: IStreamResponse[] = await unsubPromise;
            expect(resolvedUnsub[0].command).toBe(ECommands.UNSUBS);
            expect(resolvedUnsub[0].service).toBe(service);
            expect(resolvedUnsub[0].content.code).toBe(EAdminResponseCode.SUCCESS);
            expect(resolvedUnsub[0].content.msg).toBe("UNSUBS command succeeded");
        }
    });

});
