import {IAuthConfig} from "./tdapiinterface";
import WebSocket from "ws";
import moment from "moment";
import {
    EChartHistoryFuturesFrequency,
    ECommands,
    EQosLevels,
    EServices, IStreamNotify,
    StreamingResponseData,
} from "./streamingdatatypes";
import StreamingUtils, {normalizeSymbol} from "./streamingutils";
import EventEmitter from "events";
import {EUserPrincipalFields, getStreamerSubKeys, getUserPrincipals} from "./userinfo";
import {getAccounts} from "./accounts";

export interface IStreamDataTDAConfig {
    authConfig: IAuthConfig,

    // default false
    emitDataRaw?: boolean,
    // default false
    emitDataBySubRaw?: boolean,
    // default false
    emitDataBySubTyped?: boolean,
    // default false
    emitDataBySubAndTickerRaw?: boolean,
    // default true
    emitDataBySubAndTickerTyped?: boolean,

    // default 60 seconds
    reconnectRetryIntervalSeconds?: number,

    queueConfig?: IQueueConfig,

    // console.log actions as they occur
    verbose?: boolean,
    // console.debug data as it is being parsed and more detailed descriptions
    debug?: boolean,
}

export interface IStreamDataTDAConfigUpdate {
    emitDataRaw?: boolean,
    emitDataBySubRaw?: boolean,
    emitDataBySubTyped?: boolean,
    emitDataBySubAndTickerRaw?: boolean,
    emitDataBySubAndTickerTyped?: boolean,
    retryIntervalSeconds?: number,
    verbose?: boolean,
    debug?: boolean,
}

export interface IQueueConfig {
    // default 500ms; queue requests won't be dequeued less faster than this setting
    minimumSpacingMS?: number,
    // default 1000ms; an interval will be set with this timing to check that the queue request was sent in this timeframe, else will send one
    maximumSpacingMS?: number,
}

export interface IStreamParams {
    fields?: string,
    keys?: string,
    qoslevel?: EQosLevels | number,
}

export interface IGenericStreamConfig {
    service: EServices | string,
    command: ECommands | string,
    requestSeqNum?: number,
    account?: string,
    source?: string,
    parameters?: IStreamParams | any,
}

enum EQueueState {
    UN_INITIALIZED,
    AVAILABLE,
    BUSY,
}

export interface IChartHistoryFuturesGetConfig {
    symbol: string,
    frequency: EChartHistoryFuturesFrequency | string,
    /** period must be specified if start and end time aren't
     * Flexible time period examples:
     * d5, w4, n10, y1, y10
     * (d=day, w=week, n=month, y=year)
     */
    period?: string,
    startTimeMSEpoch?: number,
    endTimeMSEpoch?: number,
    requestSeqNum?: number,
}

// You may specify an account id, but it isn't strictly necessary
export interface IAccountUpdatesSubConfig {
    accountIds?: string,
    fields?: string,
    requestSeqNum?: number,
}

export declare interface StreamDataTDA {
    // events are: "heartbeat", "response", "data", "snapshot", "streamClosed", or one of the following four templates: "{service}_RAW", "{service}_RAW_{normalizedSymbol}", "{service}_TYPED", "{service}_TYPED_{normalizedSymbol}", e.g. "QUOTE_TYPED_MSFT"
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    // events are: "heartbeat", "response", "data", "snapshot", "streamClosed", or one of the following four templates: "{service}_RAW", "{service}_RAW_{normalizedSymbol}", "{service}_TYPED", "{service}_TYPED_{normalizedSymbol}", e.g. "QUOTE_TYPED_MSFT"
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    // events are: "heartbeat", "response", "data", "snapshot", "streamClosed", or one of the following four templates: "{service}_RAW", "{service}_RAW_{normalizedSymbol}", "{service}_TYPED", "{service}_TYPED_{normalizedSymbol}", e.g. "QUOTE_TYPED_MSFT"
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    off(event: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(event: string | symbol): any[];
    rawListeners(event: string | symbol): any[];
    emit(event: string | symbol, ...args: any[]): boolean;
    listenerCount(event: string | symbol): number;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    eventNames(): Array<string | symbol>;
}

/**
 * Events emitted:
 *  heartbeat - for stream heartbeats
 *  response - for stream events pertaining to QOS, LOGOUT, LOGIN;
 *  streamClosed - when the stream is closed;
 *  data - only emitted when config.emitDataRaw is true; covers all realtime data;
 *  snapshot - only emitted when config.emitDataRaw is true; applicable for CHART_FUTURES_HISTORY;
 *  {EServices}_RAW - an array of raw data for the specified service
 *  {EServices}_RAW_{normalizedSymbol} - an item of raw data for the specified service and symbol
 *  {EServices}_TYPED - an array of typed data for the specified service
 *  {EServices}_TYPED_{normalizedSymbol} - an item of typed data for the specified service and symbol
 */
export class StreamDataTDA extends EventEmitter {
    private dataStreamSocket: any;
    private userKilled: boolean;
    private userPrincipalsResponse: any;
    private requestId: number;
    // @ts-ignore
    private streamLastAlive: number;
    private streamStartupTime: number;
    private heartbeats: number[];
    private heartbeatCheckerInterval: any;
    private streamRestartsCount: number;

    readonly defaultFields: Map<string, string>;

    // internal state
    private subParams: {[index: string]: IStreamParams};
    // @ts-ignore
    private currentQosLevel: EQosLevels;
    private connectionRetryAttemptTimeouts: any[];

    // internal queue
    private queueState: EQueueState;
    private queueArr:  IQueueEntry[];

    // configurable
    private retryIntervalSeconds: number;
    private emitDataRaw: boolean;
    private emitDataBySubRaw: boolean;
    private emitDataBySubTyped: boolean;
    private emitDataBySubAndTickerRaw: boolean;
    private emitDataBySubAndTickerTyped: boolean;
    private verbose: boolean;
    private debug: boolean;
    private authConfig: IAuthConfig;

    private queueMinWaitMS: number;
    private queueMaxWaitMS: number;
    private queueLastReqTime: number;
    private queueIntervalObj: any;

    constructor(streamConfig: IStreamDataTDAConfig) {
        super();
        this.dataStreamSocket = {};
        this.userKilled = false;
        this.userPrincipalsResponse = {};
        this.requestId = 0;
        this.streamLastAlive = 0;
        this.streamStartupTime = 0;
        this.heartbeats = [];
        this.heartbeatCheckerInterval = 0;
        this.streamRestartsCount = 0;

        this.defaultFields = StreamDataTDA.setDefaultFields();

        // internal state in case of restart
        this.subParams = {};
        this.currentQosLevel = EQosLevels.L2_FAST_1000MS;
        this.connectionRetryAttemptTimeouts = [];

        // configurable
        this.retryIntervalSeconds = streamConfig.reconnectRetryIntervalSeconds || 60;
        this.emitDataRaw = streamConfig.emitDataRaw || false;
        this.emitDataBySubRaw = streamConfig.emitDataBySubRaw || false;
        this.emitDataBySubTyped = streamConfig.emitDataBySubTyped || false;
        this.emitDataBySubAndTickerRaw = streamConfig.emitDataBySubAndTickerRaw || false;
        this.emitDataBySubAndTickerTyped = streamConfig.emitDataBySubAndTickerTyped ?? true;
        this.verbose = streamConfig.verbose || false;
        this.debug = streamConfig.debug || false;
        if (streamConfig.authConfig != undefined)
            this.authConfig = streamConfig.authConfig;
        else throw "You must provide authConfig as part of the config object in the constructor call.";

        // queue
        this.queueMinWaitMS = streamConfig.queueConfig?.minimumSpacingMS || 500;
        this.queueMaxWaitMS = streamConfig.queueConfig?.maximumSpacingMS || 1000;
        this.queueIntervalObj = 0;
        this.queueLastReqTime = 0;
        this.queueState = EQueueState.UN_INITIALIZED;
        this.queueArr = [];
    }

    private static setDefaultFields() : Map<string, string> {
        const defaultFields = new Map();
        defaultFields.set(EServices.CHART_FUTURES, StreamingUtils.buildNumberArray(0, 6));
        defaultFields.set(EServices.CHART_EQUITY, StreamingUtils.buildNumberArray(0, 8));
        defaultFields.set(EServices.CHART_HISTORY_FUTURES, StreamingUtils.buildNumberArray(0, 3));

        defaultFields.set(EServices.LEVELONE_FOREX, StreamingUtils.buildNumberArray(0, 29));
        defaultFields.set(EServices.LEVELONE_FUTURES, StreamingUtils.buildNumberArray(0, 35));
        defaultFields.set(EServices.LEVELONE_FUTURES_OPTIONS, StreamingUtils.buildNumberArray(0, 35));
        defaultFields.set(EServices.OPTION, StreamingUtils.buildNumberArray(0, 41));
        defaultFields.set(EServices.QUOTE, StreamingUtils.buildNumberArray(0, 52));

        defaultFields.set(EServices.TIMESALE_EQUITY, StreamingUtils.buildNumberArray(0, 4));
        defaultFields.set(EServices.TIMESALE_OPTIONS, StreamingUtils.buildNumberArray(0, 4));
        defaultFields.set(EServices.TIMESALE_FUTURES, StreamingUtils.buildNumberArray(0, 4));
        defaultFields.set(EServices.TIMESALE_FOREX, StreamingUtils.buildNumberArray(0, 4));

        defaultFields.set(EServices.NEWS_HEADLINE, StreamingUtils.buildNumberArray(0, 10));
        defaultFields.set(EServices.NEWS_HEADLINE_LIST, StreamingUtils.buildNumberArray(0, 10));
        defaultFields.set(EServices.NEWS_STORY, StreamingUtils.buildNumberArray(0, 10));

        defaultFields.set(EServices.ACCT_ACTIVITY, StreamingUtils.buildNumberArray(0, 3));

        defaultFields.set(EServices.FUTURES_BOOK, StreamingUtils.buildNumberArray(0, 50));
        defaultFields.set(EServices.FOREX_BOOK, StreamingUtils.buildNumberArray(0, 50));
        defaultFields.set(EServices.FUTURES_OPTIONS_BOOK, StreamingUtils.buildNumberArray(0, 50));
        defaultFields.set(EServices.LISTED_BOOK, StreamingUtils.buildNumberArray(0, 50));
        defaultFields.set(EServices.NASDAQ_BOOK, StreamingUtils.buildNumberArray(0, 50));
        defaultFields.set(EServices.OPTIONS_BOOK, StreamingUtils.buildNumberArray(0, 50));

        return defaultFields;
    }

    private startHeartbeatChecker(): any {
        const restartDataStream = this.restartDataStream.bind(this);
        // default check is every minute
        return setInterval(async () => {
            if (this.verbose) console.log(new Date().toISOString() + " hb checker");
            // if the latest heartbeat was more than a minute ago
            // OR there have been no heartbeats since the stream started over a minute ago
            if (this.streamStartupTime > 0
                && (this.heartbeats[this.heartbeats.length - 1] < Date.now() - 60_000
                    || (Date.now() - this.streamStartupTime > 60_000 && this.heartbeats.length < 1))
            ) {
                restartDataStream();
            }
            if (this.heartbeats.length > 100) this.heartbeats = this.heartbeats.slice(-50);
        }, this.retryIntervalSeconds*1000);
    }

    private getDefaultFields(service: EServices): string {
        if (this.defaultFields.has(service)) {
            // @ts-ignore
            return this.defaultFields.get(service);
        } else return "";
    }

    private handleIncomingData(element: StreamingResponseData, emitEventBase: string, mappingFunction: any): void {
        if (this.verbose) console.log(`handle incoming data, ${emitEventBase}; subraw:${this.emitDataBySubRaw}, subtickerraw:${this.emitDataBySubAndTickerRaw}, subtyped:${this.emitDataBySubTyped}, subtickertyped:${this.emitDataBySubAndTickerTyped}`);
        if (this.emitDataBySubRaw) {
            if (this.debug) console.debug(`${emitEventBase}_RAW`, JSON.stringify(element.content, null, 2));
            this.emit(`${emitEventBase}_RAW`, element.content);
        }
        if (this.emitDataBySubAndTickerRaw) {
            element.content.forEach((item: any) => {
                if (this.debug) console.debug(`${emitEventBase}_RAW_${normalizeSymbol(item.key)}`, JSON.stringify(item, null, 2));
                this.emit(`${emitEventBase}_RAW_${normalizeSymbol(item.key)}`, item);
            });
        }

        if (this.emitDataBySubAndTickerTyped || this.emitDataBySubTyped) {
            if (this.verbose) console.log("typed");
            const typedResponses: any[] = element.content.map((item: any) => mappingFunction(item, element.timestamp));
            if (this.emitDataBySubTyped) {
                if (this.debug) console.debug(`${emitEventBase}_TYPED`, JSON.stringify(typedResponses, null, 2));
                this.emit(`${emitEventBase}_TYPED`, typedResponses);
            }
            if (this.emitDataBySubAndTickerTyped && typedResponses) {
                typedResponses.forEach(item => {
                    if (this.debug) console.debug(`${emitEventBase}_TYPED_${normalizeSymbol(item.key)}`, JSON.stringify(item, null, 2));
                    this.emit(`${emitEventBase}_TYPED_${normalizeSymbol(item.key)}`, item);
                });
            }
        }
    }

    /**
     * Called each time there is incoming data from the stream. This calls handleIncomingData with formatted data.
     * @param responseString
     * @param resolve
     * @private
     */
    private async handleIncoming(responseString: string, resolve: any): Promise<void> {
        // console.log('handle incoming');
        this.streamLastAlive = moment.utc().valueOf();
        this.heartbeats.push(this.streamLastAlive);
        let responseObject = null;
        try {
            responseObject = JSON.parse(responseString);
        } catch (e) {
            if (this.verbose) console.log("An exception occurred while trying to parse stream data: ", responseString);
        }
        if (!responseObject) return;

        if (this.verbose) {
            console.log("handle incoming: " + Object.keys(responseObject).join(","));
            console.log(JSON.stringify(responseObject, null, 2));
        }

        if (responseObject.notify) {
            if (this.verbose) console.log(JSON.stringify(responseObject.notify, null, 2));
            this.emit("heartbeat", responseObject.notify as IStreamNotify[]);
        }

        // such as in the case of acknowledging connection or new subscription or qos change
        if (responseObject.response) {
            // case 5.7 service === 'ADMIN' && command === 'QOS'
            // case 5.5 service === 'ADMIN' && command === 'LOGOUT'
            // case 5.3 service === 'ADMIN' && command === 'LOGIN'
            if (!this.heartbeatCheckerInterval) this.heartbeatCheckerInterval = this.startHeartbeatChecker();
            if (this.queueState === EQueueState.UN_INITIALIZED) {
                await this.qstart();
            } else {
                this.queueState = EQueueState.AVAILABLE;
                this.dequeueAndProcess();
            }
            if (this.verbose) console.log(JSON.stringify(responseObject.response, null, 2));
            this.emit("response", responseObject.response);
        }

        if (responseObject.data) {
            if (this.emitDataRaw) {
                this.emit("data", responseObject.data);
            }
            responseObject.data.forEach((element: StreamingResponseData) => {
                let fn = null;
                switch (element.service) {
                case EServices.LEVELONE_FUTURES: fn = StreamingUtils.transformL1FuturesResponse; break;
                case EServices.LEVELONE_FUTURES_OPTIONS: fn = StreamingUtils.transformL1FuturesOptionsResponse; break;
                case EServices.LEVELONE_FOREX: fn = StreamingUtils.transformL1ForexResponse; break;
                case EServices.QUOTE: fn = StreamingUtils.transformL1EquitiesResponse; break;
                case EServices.OPTION: fn = StreamingUtils.transformL1OptionsResponse; break;
                case EServices.CHART_EQUITY: fn = StreamingUtils.transformEquityChartResponse; break;
                case EServices.CHART_FUTURES: fn = StreamingUtils.transformFuturesChartResponse; break;
                case EServices.NEWS_HEADLINE: fn = StreamingUtils.transformNewsHeadlineResponse; break;
                case EServices.ACCT_ACTIVITY: fn = StreamingUtils.transformAcctActivityResponse; break;
                case EServices.TIMESALE_FOREX:
                case EServices.TIMESALE_FUTURES:
                case EServices.TIMESALE_OPTIONS:
                case EServices.TIMESALE_EQUITY: fn = StreamingUtils.transformTimeSaleResponse; break;
                case EServices.NEWS_STORY:
                case EServices.NEWS_HEADLINE_LIST:
                case EServices.ACTIVES_NASDAQ:
                case EServices.ACTIVES_NYSE:
                case EServices.ACTIVES_OPTIONS:
                case EServices.ACTIVES_OTCBB:
                case EServices.FUTURES_BOOK:
                case EServices.OPTIONS_BOOK:
                case EServices.NASDAQ_BOOK:
                case EServices.FOREX_BOOK:
                case EServices.FUTURES_OPTIONS_BOOK:
                case EServices.LISTED_BOOK: fn = StreamingUtils.identityFunction; break;
                default: break;
                }
                if (fn != null) {
                    this.handleIncomingData(element, element.service, fn);
                }
            });
        }

        if (responseObject.snapshot) {
            this.queueState = EQueueState.AVAILABLE;
            this.dequeueAndProcess();

            if (this.emitDataRaw) {
                this.emit("snapshot", responseObject.snapshot);
            }
            responseObject.snapshot.forEach((element: StreamingResponseData) => {
                if (this.verbose) console.log(`service is ${element.service}`);
                let fn = null;
                switch (element.service) {
                case EServices.CHART_HISTORY_FUTURES: fn = StreamingUtils.transformChartHistoryFuturesResponse; break;
                default: fn = () => { /* no op */ }; break;
                }
                if (fn != null) {
                    this.handleIncomingData(element, element.service, fn);
                }
            });
        }
    }

    private handleParamStorage(config: IGenericStreamConfig) {
        // handle param storage
        if (!config.service || [EServices.ADMIN, EServices.CHART_HISTORY_FUTURES].includes(config.service as EServices)) return;
        const currentParams = this.subParams[config.service];
        if (config.command === ECommands.SUBS) {
            // overwrite
            this.subParams[config.service] = {
                ...config.parameters,
            };
        } else if (config.command === ECommands.ADD) {
            // superset
            const keys = new Set();
            config.parameters?.keys?.split(",").forEach((k: string) => {
                keys.add(k);
            });
            this.subParams[config.service]?.keys?.split(",").forEach((k: string) => {
                keys.add(k);
            });
            const fields = new Set();
            config.parameters?.fields?.split(",").forEach((k: string) => {
                fields.add(k);
            });
            this.subParams[config.service]?.fields?.split(",").forEach((k: string) => {
                fields.add(k);
            });
            this.subParams[config.service] = {
                keys: Array.from(keys).join(","),
                fields: Array.from(fields).join(","),
            };
        } else if (config.command === ECommands.UNSUBS) {
            // if there are keys, that means the unsub is selective
            if (config.parameters?.keys) {
                const keys = new Set();
                this.subParams[config.service]?.keys?.split(",").forEach((k: string) => {
                    keys.add(k);
                });
                config.parameters?.keys?.split(",").forEach((k: string) => {
                    keys.delete(k);
                });
                this.subParams[config.service] = {
                    ...currentParams,
                    keys: Array.from(keys).join(","),
                };
            } else {
                this.subParams[config.service] = {};
            }
        }
    }

    private resubscribe() {
        for (const service in this.subParams) {
            const params = this.subParams[service];
            const input = {
                service: service,
                command: ECommands.SUBS,
                requestSeqNum: this.requestId++,
                parameters: params,
            };
            this.genericStreamRequest(input as IGenericStreamConfig);
        }
    }

    // called after connect success, and OPEN event received; do login, then something to keep stream alive
    private async open(loginRequest: any): Promise<void> {
        this.dataStreamSocket.send(JSON.stringify(loginRequest));
    }

    private async restartDataStream(): Promise<void> {
        this.streamRestartsCount++;

        if (this.verbose) {
            console.log("Attempting data stream estart", this.streamRestartsCount,
                "time:", new Date().toISOString(),
                (this.heartbeatCheckerInterval ? "Clearing heartbeat checker interval" : ""));
        }
        if (this.heartbeatCheckerInterval) clearInterval(this.heartbeatCheckerInterval);
        this.heartbeatCheckerInterval = 0;

        if (this.queueIntervalObj) clearInterval(this.queueIntervalObj);
        this.queueIntervalObj = 0;
        this.queueState = EQueueState.UN_INITIALIZED;

        this.once("message", () => { this.clearRetryAttempts(); this.resubscribe(); }); // set this to trigger on successful login
        this.doDataStreamLogin();
    }

    private clearRetryAttempts() {
        this.connectionRetryAttemptTimeouts.forEach(t => clearTimeout(t));
    }

    private async handleStreamClose(eventName?: string, data?: any): Promise<void> {
        const restartDataStream = this.restartDataStream.bind(this);

        if (this.verbose) console.log("handleStreamClose called");
        if (this.heartbeatCheckerInterval) clearInterval(this.heartbeatCheckerInterval);
        this.heartbeatCheckerInterval = 0;
        if (this.queueIntervalObj) clearInterval(this.queueIntervalObj);
        this.queueIntervalObj = 0;
        this.queueState = EQueueState.UN_INITIALIZED;
        if (this.userKilled) {
            if (this.verbose) console.log("stream closed, killed by user");
            this.emit("streamClosed", {attemptingReconnect: false});
        } else {
            if (this.verbose) console.log("stream closed, not killed by user, attempting restart");
            if (eventName && eventName === "error") {
                this.emit("streamError", {attemptingReconnect: true, error: String(data)});
            }
            this.emit("streamClosed", {attemptingReconnect: true});
            // attempt to reconnect
            restartDataStream();
        }
        return;
    }

    private async qstart() {
        if (this.debug) console.debug("starting queue");
        this.queueState = EQueueState.AVAILABLE;
        this.dequeueAndProcess();
        this.queueIntervalObj = setInterval(this.dequeueAndProcess.bind(this), this.queueMaxWaitMS);
    }

    private async qpush(queueEntry: IQueueEntry) {
        if (this.debug) console.debug("qpush", queueEntry.fnDesc, JSON.stringify(queueEntry.params, null, 2));
        if (queueEntry.queueRequestConfig.isPriority) {
            this.queueArr.unshift(queueEntry);
        } else {
            this.queueArr.push(queueEntry);
        }
        if (this.queueArr.length === 1 && this.queueState === EQueueState.AVAILABLE) {
            this.dequeueAndProcess();
        }
    }

    private async dequeueAndProcess() {
        if (this.debug) console.debug("deq", `queuesize:${this.queueArr.length}`, `queuestate:${EQueueState[this.queueState]}`);
        if (this.queueLastReqTime + this.queueMinWaitMS > Date.now()) return;
        if (this.queueArr.length > 0 && this.queueState === EQueueState.AVAILABLE) {
            this.queueState = EQueueState.BUSY;
            const nextInQueue: IQueueEntry | undefined = this.queueArr.shift();
            if (!nextInQueue) return;
            if (this.debug) console.debug(`processing queue item: ${nextInQueue.fnDesc} with params: ${JSON.stringify(nextInQueue.params, null, 2)}`);
            if (nextInQueue.queueRequestConfig.callbackPre) nextInQueue.queueRequestConfig.callbackPre();
            this.queueLastReqTime = Date.now();
            await nextInQueue.fn();
            if (nextInQueue.queueRequestConfig.callbackPost) nextInQueue.queueRequestConfig.callbackPost();
        }
    }

    /**
     * Update some aspects of the stream config.
     */
    setConfig(configUpdate: IStreamDataTDAConfigUpdate): void {
        this.emitDataRaw = configUpdate.emitDataRaw != undefined ? configUpdate.emitDataRaw : this.emitDataRaw;
        this.emitDataBySubRaw = configUpdate.emitDataBySubRaw != undefined ? configUpdate.emitDataBySubRaw : this.emitDataBySubRaw;
        this.emitDataBySubTyped = configUpdate.emitDataBySubTyped != undefined ? configUpdate.emitDataBySubTyped : this.emitDataBySubTyped;
        this.emitDataBySubAndTickerRaw = configUpdate.emitDataBySubAndTickerRaw != undefined ? configUpdate.emitDataBySubAndTickerRaw : this.emitDataBySubAndTickerRaw;
        this.emitDataBySubAndTickerTyped = configUpdate.emitDataBySubAndTickerTyped != undefined ? configUpdate.emitDataBySubAndTickerTyped : this.emitDataBySubAndTickerTyped;
        this.retryIntervalSeconds = configUpdate.retryIntervalSeconds || this.retryIntervalSeconds;
        this.verbose = configUpdate.verbose || false;
        this.debug = configUpdate.debug || false;
    }

    /**
     * Get the config as is currently being used
     */
    getConfig(): IStreamDataTDAConfig {
        return {
            authConfig: this.authConfig,
            emitDataRaw: this.emitDataRaw,
            emitDataBySubRaw: this.emitDataBySubRaw,
            emitDataBySubTyped: this.emitDataBySubTyped,
            emitDataBySubAndTickerRaw: this.emitDataBySubAndTickerRaw,
            emitDataBySubAndTickerTyped: this.emitDataBySubAndTickerTyped,
            reconnectRetryIntervalSeconds: this.retryIntervalSeconds,
            verbose: this.verbose,
            debug: this.debug,
            queueConfig: {
                minimumSpacingMS: this.queueMinWaitMS,
                maximumSpacingMS: this.queueMaxWaitMS,
            },
        };
    }

    /**
     * Send a custom stream request, without using one of the helper methods. This method will not capture and store state
     * of your in-progress streams, meaning in the case of disconnect and reconnect, the subscriptions won't be automatically
     * resubscribed.
     * Otherwise, use {@link genericStreamRequest}.
     * Queueing is still possible by using the queueConfig param (type {@link IQueueRequestConfig})
     */
    async sendStreamRequest(requestJSON: any, queueConfig: IQueueRequestConfig = { useQueue: false }): Promise<void> {
        this.dataStreamSocket.send(JSON.stringify(requestJSON));

        if (queueConfig && queueConfig.useQueue) {
            await this.qpush({
                fn: this.sendStreamRequest.bind(this, requestJSON),
                fnDesc: "sendStreamRequest",
                params: requestJSON,
                queueRequestConfig: queueConfig,
            });
        }
    }

    /**
     * Generic wrapper method for sending a stream request. You may also take advantage of queueing to space out requests.
     * Any requests using this method for subscriptions will have the subscription parameters stored so that in the event
     * of stream interruption and reconnection, all streams will automatically be resubscribed as they were.
     * Some other special case methods that wrap this are;
     * {@link doDataStreamLogin} for logging in to the stream; use this as startup
     * {@link doDataStreamLogout} for logging out from the stream
     * {@link qosRequest} for upgrading or downgrading the frequency of streaming data updates
     * {@link chartHistoryFuturesGet} for getting an array of historical candles for futures
     * {@link accountActivitySub} for subscribing to account updates
     * {@link accountActivityUnsub} for unsubscribing from account updates
     *
     *
     * @example <caption>Subscribe to real-time stock price updates.</caption>
     * const requestSeqNum = await genericStreamRequest({
     *     service: EServices.QUOTE,
     *     command: ECommands.SUBS,
     *     parameters: {
     *         keys: 'TSLA,F,MSFT',
     *     },
     * });
     * @example <caption>A request that sends in the specific fields to return, as well as uses the request queue.</caption>
     * const requestSeqNum = await genericStreamRequest(
     *      {
     *          service: EServices.LEVELONE_FUTURES,
     *          command: ECommands.SUBS,
     *          parameters: {
     *              keys: '/NQ,/ES',
     *              fields: '0,1,2,3,4,5,6,7,8',
     *          },
     *      },
     *      {
     *          useQueue: true,
     *      });
     * @returns {number} Returns the sequence number of the request.
     */
    async genericStreamRequest(config: IGenericStreamConfig, queueConfig: IQueueRequestConfig = { useQueue: false }) : Promise<number> {
        if (!config) throw "You must pass in a config object";
        const localConfig = { ...config };
        if (!localConfig.requestSeqNum) localConfig.requestSeqNum = this.requestId++;

        if (queueConfig?.useQueue) {
            await this.qpush({
                fn: this.genericStreamRequest.bind(this, localConfig),
                fnDesc: "genericStreamRequest",
                params: localConfig,
                queueRequestConfig: { ...queueConfig },
            });
            return localConfig.requestSeqNum;
        }

        const parameters = { ...localConfig.parameters };
        const {requestSeqNum, service, command, account, source} = localConfig;
        if ([ECommands.SUBS, ECommands.ADD].includes(command as ECommands)) {
            if (!parameters || !parameters.keys) throw "With commands ADD or SUBS, your config object must have parameters";
            if (!parameters.fields) {
                parameters.fields = this.getDefaultFields(localConfig.service as EServices);
            }
        }

        // store parameters so the streams can be recovered in case of websocket connection loss
        this.handleParamStorage(localConfig);

        const request = {
            requests: [
                {
                    service: service,
                    requestid: `${requestSeqNum}`,
                    command: command,
                    account: account || this.userPrincipalsResponse.accounts[0].accountId,
                    source: source || this.userPrincipalsResponse.streamerInfo.appId,
                    parameters,
                },
            ],
        };
        this.dataStreamSocket.send(JSON.stringify(request));
        return requestSeqNum;
    }

    /**
     * This method must be called to log in to the stream. If you want to have an event listener for login, set it
     * before calling this login method.
     * You may optionally specify a qosLevel; the default is L2, 1 second.
     */
    async doDataStreamLogin(
        qosLevel: EQosLevels = EQosLevels.L2_FAST_1000MS,
    ) : Promise<any> {
        // if now is within 30 seconds of last alive, do nothing
        this.userKilled = false;
        if (this.verbose) console.log("doDataStreamLogin");
        this.userPrincipalsResponse = await getUserPrincipals({
            fields: [EUserPrincipalFields.PREFERENCES,
                EUserPrincipalFields.SURROGATE_IDS,
                EUserPrincipalFields.STREAMER_SUB_KEYS,
                EUserPrincipalFields.STREAMER_CONNECTION_INFO],
            authConfig: this.authConfig});
        // console.log(`userPrincipals: ${JSON.stringify(this.userPrincipalsResponse)}`);

        //Converts ISO-8601 response in snapshot to ms since epoch accepted by Streamer
        const tokenTimeStampAsDateObj = new Date(this.userPrincipalsResponse.streamerInfo.tokenTimestamp);
        const tokenTimeStampAsMs = tokenTimeStampAsDateObj.getTime();

        const credentials = {
            "userid": this.userPrincipalsResponse.accounts[0].accountId,
            "token": this.userPrincipalsResponse.streamerInfo.token,
            "company": this.userPrincipalsResponse.accounts[0].company,
            "segment": this.userPrincipalsResponse.accounts[0].segment,
            "cddomain": this.userPrincipalsResponse.accounts[0].accountCdDomainId,
            "usergroup": this.userPrincipalsResponse.streamerInfo.userGroup,
            "accesslevel": this.userPrincipalsResponse.streamerInfo.accessLevel,
            "authorized": "Y",
            "timestamp": tokenTimeStampAsMs,
            "appid": this.userPrincipalsResponse.streamerInfo.appId,
            "acl": this.userPrincipalsResponse.streamerInfo.acl,
        };

        const loginRequest = {
            "requests": [
                {
                    "service": EServices.ADMIN,
                    "command": ECommands.LOGIN,
                    "requestid": `${this.requestId++}`,
                    "account": this.userPrincipalsResponse.accounts[0].accountId,
                    "source": this.userPrincipalsResponse.streamerInfo.appId,
                    "parameters": {
                        "credential": StreamingUtils.jsonToQueryString(credentials),
                        "token": this.userPrincipalsResponse.streamerInfo.token,
                        "version": "1.0",
                        "qoslevel": `${qosLevel}`,
                    },
                },
            ],
        };

        return new Promise((resolve) => {
            this.dataStreamSocket = new WebSocket("wss://" + this.userPrincipalsResponse.streamerInfo.streamerSocketUrl + "/ws");

            this.dataStreamSocket.on("message", (response: string) => this.handleIncoming.call(this, response, resolve));

            this.dataStreamSocket.on("close", () => this.handleStreamClose.call(this, "close"));

            this.dataStreamSocket.on("error", (data: any) => this.handleStreamClose.call(this, "error", data));

            this.dataStreamSocket.on("open", () => this.open.call(this, loginRequest));
        });
    }

    /**
     * After calling this, wait for the emitting event 'streamClosed' with data {attemptingReconnect: false}
     */
    async doDataStreamLogout(): Promise<void> {
        this.userKilled = true;
        if (this.heartbeatCheckerInterval) clearInterval(this.heartbeatCheckerInterval);
        this.heartbeatCheckerInterval = 0;
        if (this.queueIntervalObj) clearInterval(this.queueIntervalObj);
        this.queueIntervalObj = 0;
        this.queueState = EQueueState.UN_INITIALIZED;
        await this.genericStreamRequest({
            service: EServices.ADMIN,
            requestSeqNum: this.requestId++,
            command: ECommands.LOGOUT,
            parameters: {},
        });
        // this.dataStreamSocket.close();
    }

    /**
     * Change the qosLevel of your stream, meaning data streams faster or slower. Possible values are
     * in the enum {@link EQosLevels}, ranging from 500ms to 5sec. Default is level 2, 1 second.
     */
    async qosRequest(qosConfig: IQosRequestConfig, queueConfig?: IQueueRequestConfig) : Promise<number> {
        const localConfig = { ...qosConfig };
        localConfig.requestSeqNum = localConfig.requestSeqNum ?? this.requestId++;
        if (queueConfig?.useQueue) {
            await this.qpush({
                fn: this.qosRequest.bind(this, localConfig),
                fnDesc: "qosRequest",
                params: localConfig,
                queueRequestConfig: { ...queueConfig },
            });
            return localConfig.requestSeqNum;
        }

        if (!EQosLevels[localConfig.qosLevel]) return 0;
        this.currentQosLevel = localConfig.qosLevel;
        return await this.genericStreamRequest({
            service: EServices.ADMIN,
            requestSeqNum: localConfig.requestSeqNum,
            command: ECommands.QOS,
            parameters: {
                qoslevel: localConfig.qosLevel,
            },
        });
    }

    /**
     * Get historical candles for futures. This is a transactional request, not a stream subscription.
     * Specify period OR (startTimeMSEpoch and endTimeMSEpoch)
     * This request can optionally be queued.
     */
    async chartHistoryFuturesGet(config: IChartHistoryFuturesGetConfig, queueConfig?: IQueueRequestConfig) : Promise<number> {
        if (!config.period && (!config.startTimeMSEpoch || !config.endTimeMSEpoch)) {
            throw new Error("either specify a period or provide a start and end time");
        }

        const requestSeqNum = config.requestSeqNum ?? ++this.requestId;

        if (queueConfig?.useQueue) {
            await this.qpush({
                fn: this.chartHistoryFuturesGet.bind(this, { ...config, requestSeqNum }),
                fnDesc: "chartHistoryFuturesGet",
                params: { ...config, requestSeqNum },
                queueRequestConfig: { ...queueConfig },
            });
            return requestSeqNum;
        }

        const request = {
            "requests": [
                {
                    "service": EServices.CHART_HISTORY_FUTURES,
                    "requestid": `${requestSeqNum}`,
                    "command": ECommands.GET,
                    "account": this.userPrincipalsResponse.accounts[0].accountId,
                    "source": this.userPrincipalsResponse.streamerInfo.appId,
                    "parameters": {
                        "symbol": config.symbol,
                        "frequency": config.frequency,
                        "period": config.period,
                        "START_TIME": config.startTimeMSEpoch,
                        "END_TIME": config.endTimeMSEpoch,
                    },
                },
            ],
        };
        this.dataStreamSocket.send(JSON.stringify(request));
        return requestSeqNum;
    }


    /**
     * Subscribe to real-time data updates on specified account ids. Each subsequent call overrides the previous one.
     * You may optionally queue this request.
     */
    async accountActivitySub(config?: IAccountUpdatesSubConfig, queueConfig?: IQueueRequestConfig): Promise<number> {
        const localConfig = { ...config };
        if (!localConfig.fields) localConfig.fields = "0,1,2,3";
        if (!localConfig.requestSeqNum) localConfig.requestSeqNum = this.requestId++;

        if (queueConfig?.useQueue) {
            await this.qpush({
                fn: this.accountActivitySub.bind(this, localConfig),
                fnDesc: "accountActivitySub",
                params: localConfig,
                queueRequestConfig: { ...queueConfig },
            });
            return localConfig.requestSeqNum;
        }

        if (!localConfig.accountIds) {
            const allAccounts = await getAccounts({
                authConfig: this.authConfig,
                authConfigFileAccess: "NONE",
            });
            localConfig.accountIds = allAccounts
                .map((acct: any) => {
                    const acctIds = [];
                    for (const acctLabel in acct) acctIds.push(acct[acctLabel].accountId);
                    return acctIds.join(",");
                })
                .join(",");
        }

        const streamKeyObj = await getStreamerSubKeys({
            accountIds: localConfig.accountIds,
            authConfig: this.authConfig,
            authConfigFileAccess: "NONE",
        });

        const genericConfig : IGenericStreamConfig = {
            parameters: {
                keys: streamKeyObj.keys[0].key,
                fields: localConfig.fields,
            },
            service: EServices.ACCT_ACTIVITY,
            command: ECommands.SUBS,
            requestSeqNum: localConfig.requestSeqNum,
        };

        return await this.genericStreamRequest(genericConfig);
    }

    /**
     * Use this request to unsubscribe from account updates. This request can optionally be queued.
     */
    async accountActivityUnsub(requestSeqNum?: number, queueConfig?: IQueueRequestConfig) : Promise<number> {
        requestSeqNum = requestSeqNum ?? this.requestId++;

        if (queueConfig?.useQueue) {
            await this.qpush({
                fn: this.accountActivityUnsub.bind(this, requestSeqNum),
                fnDesc: "accountActivityUnsub",
                params: { requestSeqNum },
                queueRequestConfig: { ...queueConfig },
            });
            return requestSeqNum;
        }

        const config : IGenericStreamConfig = {
            service: EServices.ACCT_ACTIVITY,
            command: ECommands.UNSUBS,
            requestSeqNum,
        };

        return await this.genericStreamRequest(config);
    }

    /**
     * Use this method to clear the pending queue.
     */
    queueClear(): void {
        if (this.verbose) console.log("clear queue");
        this.queueArr = [];
    }

    /**
     * Use this method to see what is pending in the queue
     */
    queueInfo(): IQueueInfo[] {
        return this.queueArr.map(qe => ({
            desc: qe.fnDesc,
            params: qe.params,
        }));
    }
}

interface IQueueEntry {
    fn: any,
    fnDesc: string,
    params: any,
    queueRequestConfig: IQueueRequestConfig,
}

export interface IQueueRequestConfig {
    useQueue: boolean,
    // if TRUE, gets added to front of the queue
    isPriority?: boolean,
    // this callback is called after dequeue and immediately before sending the request
    callbackPre?: any,
    // this callback is called after dequeue and immediately after sending the request
    callbackPost?: any,
}

export interface IQosRequestConfig {
    qosLevel: EQosLevels | number,
    requestSeqNum?: number,
}

export interface IQueueInfo {
    desc: string,
    params: any,
}
