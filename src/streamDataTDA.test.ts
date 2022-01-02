import path from "path";
import {getAccounts} from "./accounts";
import {TacRequestConfig} from "./tdapiinterface";
import {IChartHistoryFuturesGetConfig, IStreamDataTDAConfig, StreamDataTDA} from "./streamDataTDA";
import authConfig from "./test_tdaclientauth.json";
import {
    ECommands,
    EAdminResponseCode,
    EQosLevels,
    EServices,
    ILoginLogoutResponse,
    IStreamNotify,
    IStreamResponse, ChartHistoryFutures, ChartHistoryFuturesRough, EChartHistoryFuturesFrequency,
} from "./streamingdatatypes";
import StreamingUtils from "./streamingutils";

const testauthpath = path.join(__dirname, "test_tdaclientauth.json");

jest.setTimeout(30000);

describe("streaming", () => {
    let accountId = "";

    const baseConfig: TacRequestConfig = {
        verbose: false,
        authConfigFileLocation: testauthpath,
    };

    const baseStreamConfig: IStreamDataTDAConfig = {
        authConfig,
        verbose: false,
    };

    beforeAll(async () => {
        // first find an account for placing the order
        const accounts = await getAccounts({
            ...baseConfig,
        });
        accountId = accounts[0].securitiesAccount.accountId;
    });

    describe("ADMIN functions and heartbeat", () => {
        // heartbeat, response, data, snapshot, streamClosed
        test("subscribe to stream and get the login response", async () => {
            const tdaDataStream = new StreamDataTDA(baseStreamConfig);
            const loginResponse: IStreamResponse[] = await new Promise((res, rej) => {
                tdaDataStream.once("response", (data: IStreamResponse[]) => {
                    res(data);
                });

                tdaDataStream.doDataStreamLogin();
            });
            expect(loginResponse).toBeTruthy();
            expect(loginResponse[0].service).toBe(EServices.ADMIN);
            expect(loginResponse[0].command).toBe(ECommands.LOGIN);
            expect((loginResponse[0].content as ILoginLogoutResponse).code).toBe(EAdminResponseCode.SUCCESS);
        });

        test("subscribe to stream and get a heartbeat", async () => {
            const tdaDataStream = new StreamDataTDA(baseStreamConfig);
            const hbResponse: IStreamNotify[] = await new Promise((res, rej) => {
                tdaDataStream.once("heartbeat", (data: IStreamNotify[]) => {
                    res(data);
                });

                tdaDataStream.doDataStreamLogin();
            });
            expect(hbResponse).toBeTruthy();
            expect(hbResponse[0].heartbeat).toBeTruthy();
        });

        test("subscribe to stream, logout, and get the logout response", async () => {
            const tdaDataStream = new StreamDataTDA(baseStreamConfig);
            const logoutResponse: IStreamResponse[] = await new Promise((res, rej) => {
                tdaDataStream.on("response", (data: IStreamResponse[]) => {
                    if (data.some(r => r.command === ECommands.LOGOUT)) {
                        res(data);
                    }
                });

                tdaDataStream.doDataStreamLogin();
                setTimeout(() => tdaDataStream.doDataStreamLogout(), 5000);
            });
            expect(logoutResponse).toBeTruthy();
            expect(logoutResponse[0].service).toBe(EServices.ADMIN);
            expect(logoutResponse[0].command).toBe(ECommands.LOGOUT);
            expect((logoutResponse[0].content as ILoginLogoutResponse).code).toBe(EAdminResponseCode.SUCCESS);
            expect((logoutResponse[0].content as ILoginLogoutResponse).msg).toBe("SUCCESS");
        });

        test("logging out emits streamClosed", async () => {
            const tdaDataStream = new StreamDataTDA(baseStreamConfig);
            const streamClosedEmit: any = await new Promise((res, rej) => {
                tdaDataStream.on("streamClosed", (data: any) => {
                    res(data);
                });

                tdaDataStream.doDataStreamLogin();
                setTimeout(() => tdaDataStream.doDataStreamLogout(), 5000);
            });
            expect(streamClosedEmit).toBeTruthy();
            expect(streamClosedEmit.attemptingReconnect).toBe(false);
        });

        test("QOS change works as expected", async () => {
            const targetQoSLevel = EQosLevels.L3_MODERATE_1500MS;

            const tdaDataStream = new StreamDataTDA(baseStreamConfig);
            const qosResponse: IStreamResponse[] = await new Promise((res, rej) => {
                tdaDataStream.on("response", (data: IStreamResponse[]) => {
                    if(data[0].command === ECommands.QOS) res(data);
                });

                tdaDataStream.doDataStreamLogin();
                setTimeout(() => tdaDataStream.qosRequest(targetQoSLevel), 5000);
            });
            expect(qosResponse).toBeTruthy();
            expect(qosResponse[0].service).toBe(EServices.ADMIN);
            expect(qosResponse[0].command).toBe(ECommands.QOS);
            expect((qosResponse[0].content as ILoginLogoutResponse).code).toBe(EAdminResponseCode.SUCCESS);
            expect((qosResponse[0].content as ILoginLogoutResponse).msg).toBe(`QoS command succeeded. Set qoslevel=${targetQoSLevel}`);
        });
    });

    describe("SNAPSHOT data functions", () => {
        test.skip("CHART_HISTORY_FUTURES raw", async () => {
            const tdaDataStream = new StreamDataTDA({
                ...baseStreamConfig,
                emitDataRaw: true,
            });
            const streamResponse: IStreamResponse[] = await new Promise((res, rej) => {
                tdaDataStream.on("snapshot", (data: IStreamResponse[]) => {
                    res(data);
                });

                tdaDataStream.once("response", (data: IStreamResponse[]) => {
                    const futuresGetConfig: IChartHistoryFuturesGetConfig = {
                        symbol: "/ES",
                        frequency: EChartHistoryFuturesFrequency.MINUTE_THIRTY,
                        period: "d5",
                    };

                    tdaDataStream.chartHistoryFuturesGet(futuresGetConfig);
                });

                tdaDataStream.doDataStreamLogin();
            });

            expect(streamResponse).toBeTruthy();
            expect(streamResponse[0].command).toBe(ECommands.GET);
            expect(streamResponse[0].service).toBe(EServices.CHART_HISTORY_FUTURES);
            const chartHistoryFutures: ChartHistoryFuturesRough = streamResponse[0].content[0];
            expect(chartHistoryFutures.key).toBe("/ES");
            expect(chartHistoryFutures["2"]).toBe(chartHistoryFutures["3"].length);
        });

        test.skip("CHART_HISTORY_FUTURES data by sub raw", async () => {
            const tdaDataStream = new StreamDataTDA({
                ...baseStreamConfig,
                emitDataBySubRaw: true,
            });
            const streamResponse: ChartHistoryFuturesRough[] = await new Promise((res, rej) => {
                tdaDataStream.on("CHART_HISTORY_FUTURES_RAW", (data: ChartHistoryFuturesRough[]) => {
                    res(data);
                });

                tdaDataStream.once("response", () => {
                    const futuresGetConfig: IChartHistoryFuturesGetConfig = {
                        symbol: "/ES",
                        frequency: EChartHistoryFuturesFrequency.MINUTE_THIRTY,
                        period: "d5",
                    };

                    tdaDataStream.chartHistoryFuturesGet(futuresGetConfig);
                });

                tdaDataStream.doDataStreamLogin();
            });

            expect(streamResponse).toBeTruthy();
            const chartHistoryFutures: ChartHistoryFuturesRough = streamResponse[0];
            expect(chartHistoryFutures.key).toBe("/ES");
            expect(chartHistoryFutures["2"]).toBe(chartHistoryFutures["3"].length);
        });

        test.skip("CHART_HISTORY_FUTURES data by sub and ticker raw", async () => {
            const tdaDataStream = new StreamDataTDA({
                ...baseStreamConfig,
                emitDataBySubAndTickerRaw: true,
            });
            const streamResponse: ChartHistoryFuturesRough = await new Promise((res, rej) => {
                tdaDataStream.on("CHART_HISTORY_FUTURES_RAW__ES", (data: ChartHistoryFuturesRough) => {
                    res(data);
                });

                tdaDataStream.once("response", () => {
                    const futuresGetConfig: IChartHistoryFuturesGetConfig = {
                        symbol: "/ES",
                        frequency: EChartHistoryFuturesFrequency.MINUTE_THIRTY,
                        period: "d5",
                    };

                    tdaDataStream.chartHistoryFuturesGet(futuresGetConfig);
                });

                tdaDataStream.doDataStreamLogin();
            });

            expect(streamResponse).toBeTruthy();
            expect(streamResponse.key).toBe("/ES");
            expect(streamResponse["2"]).toBe(streamResponse["3"].length);
        });

        test.skip("CHART_HISTORY_FUTURES data by sub typed", async () => {
            const tdaDataStream = new StreamDataTDA({
                ...baseStreamConfig,
                emitDataBySubTyped: true,
            });
            const streamResponse: ChartHistoryFutures[] = await new Promise((res, rej) => {
                tdaDataStream.on("CHART_HISTORY_FUTURES_TYPED", (data: ChartHistoryFutures[]) => {
                    res(data);
                });

                tdaDataStream.once("response", () => {
                    const futuresGetConfig: IChartHistoryFuturesGetConfig = {
                        symbol: "/ES",
                        frequency: EChartHistoryFuturesFrequency.MINUTE_THIRTY,
                        period: "d5",
                    };

                    tdaDataStream.chartHistoryFuturesGet(futuresGetConfig);
                });

                tdaDataStream.doDataStreamLogin();
            });

            expect(streamResponse).toBeTruthy();
            expect(streamResponse[0].key).toBe("/ES");
            expect(streamResponse[0].count).toBe(streamResponse[0].candles.length);
        });

        test.skip("CHART_HISTORY_FUTURES data by sub and ticker typed", async () => {
            const tdaDataStream = new StreamDataTDA({
                ...baseStreamConfig,
                emitDataBySubAndTickerTyped: true,
            });
            const streamResponse: ChartHistoryFutures = await new Promise((res, rej) => {
                tdaDataStream.on("CHART_HISTORY_FUTURES_TYPED__ES", (data: ChartHistoryFutures) => {
                    res(data);
                });

                tdaDataStream.once("response", () => {
                    const futuresGetConfig: IChartHistoryFuturesGetConfig = {
                        symbol: "/ES",
                        frequency: EChartHistoryFuturesFrequency.MINUTE_THIRTY,
                        period: "d5",
                    };

                    tdaDataStream.chartHistoryFuturesGet(futuresGetConfig);
                });

                tdaDataStream.doDataStreamLogin();
            });

            expect(streamResponse).toBeTruthy();
            expect(streamResponse.key).toBe("/ES");
            expect(streamResponse.count).toBe(streamResponse.candles.length);
        });

        test("CHART_HISTORY_FUTURES", async () => {
            const tdaDataStream = new StreamDataTDA({
                ...baseStreamConfig,
                emitDataRaw: true,
                emitDataBySubRaw: true,
                emitDataBySubAndTickerRaw: true,
                emitDataBySubTyped: true,
                emitDataBySubAndTickerTyped: true,
            });

            const emitEventBase = EServices.CHART_HISTORY_FUTURES;
            const symbol = "/ES";
            const normalizedSymbol = StreamingUtils.normalizeSymbol(symbol);

            const promises = [
                new Promise((res) =>
                    tdaDataStream.on(`snapshot`, (data: IStreamResponse) => res(data))),
                new Promise((res) =>
                    tdaDataStream.on(`${emitEventBase}_RAW`, (data: any) => res(data))),
                new Promise((res) =>
                    tdaDataStream.on(`${emitEventBase}_RAW_${normalizedSymbol}`, (data: any) => res(data))),
                new Promise((res) =>
                    tdaDataStream.on(`${emitEventBase}_TYPED`, (data: any) => res(data))),
                new Promise((res) =>
                    tdaDataStream.on(`${emitEventBase}_TYPED_${normalizedSymbol}`, (data: any) => res(data))),
            ];

            tdaDataStream.once("response", () => {
                const futuresGetConfig: IChartHistoryFuturesGetConfig = {
                    symbol: "/ES",
                    frequency: EChartHistoryFuturesFrequency.MINUTE_THIRTY,
                    period: "d5",
                };

                tdaDataStream.chartHistoryFuturesGet(futuresGetConfig);
            });

            tdaDataStream.doDataStreamLogin();

            const tuple = await Promise.all(promises) as [IStreamResponse[],
                ChartHistoryFuturesRough[],
                ChartHistoryFuturesRough,
                ChartHistoryFutures[],
                ChartHistoryFutures];
            const [raw, subRaw, subTickerRaw, subTyped, subTickerTyped] = tuple;

            expect(raw).toBeTruthy();
            expect(raw[0].command).toBe(ECommands.GET);
            expect(raw[0].service).toBe(emitEventBase);
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
        });

        test("NEWS_HEADLINE_LIST", async () => {
            // do nothing
        });
    });
});
