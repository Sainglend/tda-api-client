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
import StreamingUtils from "./streamingutils";
import EventEmitter from "events";
import {EUserPrincipalFields, getStreamerSubKeys, getUserPrincipals} from "./userinfo";
import {getAccounts} from "./accounts";

export interface IStreamDataTDAConfig {
    authConfig?: IAuthConfig,

    emitDataRaw?: boolean,
    emitDataBySubRaw?: boolean,
    emitDataBySubTyped?: boolean,
    emitDataBySubAndTickerRaw?: boolean,
    emitDataBySubAndTickerTyped?: boolean,

    reconnectRetryIntervalSeconds?: number,

    queueConfig?: IQueueConfig,

    verbose?: boolean,
    debug?: boolean,
}

export interface IQueueConfig {
    minimumSpacingMS?: number,
    maximumSpacingMS?: number,
}

export interface IStreamParams {
    fields?: string,
    keys?: string,
    qoslevel?: EQosLevels,
}

export interface IGenericStreamConfig {
    service: EServices,
    command: ECommands,
    requestSeqNum?: number,
    account?: string,
    source?: string,
    parameters?: IStreamParams,
}

enum EQueueState {
    UN_INITIALIZED,
    AVAILABLE,
    BUSY,
}

export interface IChartHistoryFuturesGetConfig {
    symbol: string,
    frequency: EChartHistoryFuturesFrequency,
    period?: string,
    startTimeMSEpoch?: number,
    endTimeMSEpoch?: number,
    requestSeqNum?: number,
}

/**
 * Events emitted:
 *  heartbeat - for stream heartbeats
 *  response - for stream events pertaining to QOS, LOGOUT, LOGIN;
 *  streamClosed - when the stream is closed;
 *  data - only emitted when config.emitDataRaw is true; covers all realtime data;
 *  snapshot - only emitted when config.emitDataRaw is true; applicable for CHART_FUTURES_HISTORY;
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
    private queueArr:  any[];

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
                if (this.debug) console.debug(`${emitEventBase}_RAW_${StreamingUtils.normalizeSymbol(item.key)}`, JSON.stringify(item, null, 2));
                this.emit(`${emitEventBase}_RAW_${StreamingUtils.normalizeSymbol(item.key)}`, item);
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
                    if (this.debug) console.debug(`${emitEventBase}_TYPED_${StreamingUtils.normalizeSymbol(item.key)}`, JSON.stringify(item, null, 2));
                    this.emit(`${emitEventBase}_TYPED_${StreamingUtils.normalizeSymbol(item.key)}`, item);
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
        if (!config.service || [EServices.ADMIN, EServices.CHART_HISTORY_FUTURES].includes(config.service)) return;
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
        if (this.heartbeatCheckerInterval) {
            if (this.verbose) console.log("Clearing heartbeat checker for restart", this.streamRestartsCount, "time:", new Date().toISOString());
            if (this.heartbeatCheckerInterval) clearInterval(this.heartbeatCheckerInterval);
            this.heartbeatCheckerInterval = 0;
            if (this.queueIntervalObj) clearInterval(this.queueIntervalObj);
            this.queueIntervalObj = 0;
            this.queueState = EQueueState.UN_INITIALIZED;
        }
        this.once("message", () => { this.clearRetryAttempts(); this.resubscribe(); }); // set this to trigger on successful login
        this.doDataStreamLogin();
    }

    private clearRetryAttempts() {
        this.connectionRetryAttemptTimeouts.forEach(t => clearTimeout(t));
    }

    private async handleStreamClose(): Promise<void> {
        console.log("handleStreamClose called");
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
            this.emit("streamClosed", {attemptingReconnect: true});
            // attempt to reconnect
            await this.restartDataStream();
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
        this.queueArr.push(queueEntry);
        if (this.queueArr.length === 1 && this.queueState === EQueueState.AVAILABLE) {
            this.dequeueAndProcess();
        }
    }

    private async dequeueAndProcess() {
        if (this.debug) console.debug("deq", `queuesize:${this.queueArr.length}`, `queuestate:${EQueueState[this.queueState]}`);
        if (this.queueLastReqTime + this.queueMinWaitMS > Date.now()) return;
        if (this.queueArr.length > 0 && this.queueState === EQueueState.AVAILABLE) {
            this.queueState = EQueueState.BUSY;
            const nextInQueue: IQueueEntry = this.queueArr.shift();
            if (this.debug) console.debug(`processing queue item: ${nextInQueue.fnDesc} with params: ${JSON.stringify(nextInQueue.params, null, 2)}`);
            if (nextInQueue.queueRequestConfig.cbPre) nextInQueue.queueRequestConfig.cbPre();
            this.queueLastReqTime = Date.now();
            await nextInQueue.fn();
            if (nextInQueue.queueRequestConfig.cbPost) nextInQueue.queueRequestConfig.cbPost();
        }
    }

    setConfig(config: IStreamDataTDAConfig): void {
        this.emitDataRaw = config.emitDataRaw != undefined ? config.emitDataRaw : this.emitDataRaw;
        this.emitDataBySubRaw = config.emitDataBySubRaw != undefined ? config.emitDataBySubRaw : this.emitDataBySubRaw;
        this.emitDataBySubTyped = config.emitDataBySubTyped != undefined ? config.emitDataBySubTyped : this.emitDataBySubTyped;
        this.emitDataBySubAndTickerRaw = config.emitDataBySubAndTickerRaw != undefined ? config.emitDataBySubAndTickerRaw : this.emitDataBySubAndTickerRaw;
        this.emitDataBySubAndTickerTyped = config.emitDataBySubAndTickerTyped != undefined ? config.emitDataBySubAndTickerTyped : this.emitDataBySubAndTickerTyped;
        this.retryIntervalSeconds = config.reconnectRetryIntervalSeconds || this.retryIntervalSeconds;
        this.verbose = config.verbose || false;
        this.debug = config.debug || false;
    }

    getConfig(): IStreamDataTDAConfig {
        return {
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
     * A method to do stuff.
     * @param {object} config
     * @param {EServices} config.service - use the SERVICES enum
     * @param {ECommands} config.command - use the COMMANDS enum
     * @param {IStreamParams} config.parameters - keys (required) and fields (optional; will default to all)
     * @param {number} [config.requestSeqNum] - (optional) supply your own request sequence number, or it will be auto generated
     * @param {string} [config.account] - (optional) supply an account id, or it will be retrieved using your credentials
     * @param {string} [config.source] - (optional) supply a streamer app id, or it will be retrieved using your credentials
     * @example The most bare-bones request. Note no fields in the parameters object.
     * genericStreamRequest({
     *     service: SERVICES.QUOTE,
     *     command: COMMANDS.SUBS,
     *     parameters: {
     *         keys: 'TSLA,F,MSFT'
     *     }
     * });
     * @example <caption>A more typical request, sending in the specific fields to return.</caption>
     * genericStreamRequest({
     *     service: SERVICES.LEVELONE_FUTURES,
     *     command: COMMANDS.SUBS,
     *     parameters: {
     *         keys: '/NQ,/ES',
     *         fields: '0,1,2,3,4,5,6,7,8'
     *     }
     * });
     * @returns {number} Returns the sequence number of the request.
     */
    async genericStreamRequest(config: IGenericStreamConfig) : Promise<number> {
        if (!config) throw "You must pass in a config object";
        let {requestSeqNum, parameters} = config;
        const {service, command, account, source} = config;
        if ([ECommands.SUBS, ECommands.ADD].includes(command)) {
            if (!parameters || !parameters.keys) throw "With commands ADD or SUBS, your config object must have parameters";
            if (!parameters.fields) {
                parameters.fields = this.getDefaultFields(config.service);
            }
        }

        // store parameters so the streams can be recovered in case of websocket connection loss
        this.handleParamStorage(config);


        if (!requestSeqNum) requestSeqNum = this.requestId++;
        if (!parameters) parameters = {};
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

    async doDataStreamLogin(
        //fields: string = 'streamerSubscriptionKeys,streamerConnectionInfo,preferences,surrogateIds',
        fields: EUserPrincipalFields[] = [EUserPrincipalFields.PREFERENCES, EUserPrincipalFields.SURROGATE_IDS, EUserPrincipalFields.STREAMER_SUB_KEYS, EUserPrincipalFields.STREAMER_CONNECTION_INFO],
        qosLevel: EQosLevels = EQosLevels.L2_FAST_1000MS,
    ) : Promise<any> {
        // if now is within 30 seconds of last alive, do nothing
        this.userKilled = false;
        if (this.verbose) console.log("doDataStreamLogin");
        this.userPrincipalsResponse = await getUserPrincipals({fields, authConfig: this.authConfig});
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

        return new Promise((resolve, reject) => {
            this.dataStreamSocket = new WebSocket("wss://" + this.userPrincipalsResponse.streamerInfo.streamerSocketUrl + "/ws");

            this.dataStreamSocket.on("message", (response: string) => this.handleIncoming.call(this, response, resolve));

            this.dataStreamSocket.on("close", () => this.handleStreamClose.call(this));

            this.dataStreamSocket.on("open", () => this.open.call(this, loginRequest));
        });
    }

    /**
     * After calling this, wait for the emitting event 'streamClosed' with {attemptingReconnect: false}
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
     * Subscribe to real-time data updates on specified futures symbols.
     * Each subsequent call overrides the previous, so (1) /NQ then (2) /ES will result in just /ES.
     * With the second request you'd need to pass in "/NQ,/ES"
     * Can use format /ES or a specific contract /ESM21
     * @param {EQosLevels} qosLevel - comma-separated symbols, e.g. "/NQ,/ES"
     * @param requestSeqNum {number} - defaulted to an incrementing integer
     * @returns A Promise with the request sequence number, 0 if error
     * @async
     */
    async qosRequest(qosLevel: EQosLevels, requestSeqNum: number = this.requestId++) : Promise<number> {
        if (!EQosLevels[qosLevel]) return 0;
        this.currentQosLevel = qosLevel;
        return await this.genericStreamRequest({
            service: EServices.ADMIN,
            requestSeqNum,
            command: ECommands.QOS,
            parameters: {
                qoslevel: qosLevel,
            },
        });
    }

    /**
     * Get historical candles for futures. Specify period OR (startTimeMSEpoch and endTimeMSEpoch)
     *
     * @param {string} symbol - Futures symbol, such as "/ES" or "/ESM21"
     * @param {EChartHistoryFuturesFrequency} frequency - Choose the candle size for the historical data. Choices: m1, m5, m10, m30, h1, d1, w1, n1 (m=minute, h=hour, d=day, w=week, n=month)
     * @param {string} [period] - (Optional / REQURIED if no start/end time) Specify period with a string such as d5, w4, n10, y1, y10 (d=day, w=week, n=month, y=year)
     * @param {number} [startTimeMSEpoch] - (Optional / REQUIRED if no period) A number representing the time in milliseconds since epoch.
     * @param {number} [endTimeMSEpoch] - (Optional / REQUIRED if no period) A number representing the time in milliseconds since epoch.
     * @param {number} [requestSeqNum] - (Optional) The sequence number for the request, default is the class counter
     * @returns A Promise with the request sequence number, 0 if error
     * @async
     */
    async chartHistoryFuturesGet(config: IChartHistoryFuturesGetConfig) : Promise<number> {
        if (!config.period && (!config.startTimeMSEpoch || !config.endTimeMSEpoch)) throw new Error("either specify a period or provide a start and end time");

        const requestSeqNum = config.requestSeqNum ?? ++this.requestId;

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
     *
     * @param {string} [accountIds] - (Optional) comma-separated list of TDA account numbers, default is all account ids that can be retrieved with your credentials
     * @param {string} [fields] - (Optional) comma-separated field numbers, default all 0-3
     * @param {number} [requestSeqNum] - (Optional) defaulted to an incrementing integer
     * @param tacBaseConfig
     * @returns A Promise with the request sequence number, 0 if error
     * @async
     */
    async accountActivitySub(
        accountIds = "",
        fields = "0,1,2,3",
        requestSeqNum: number = this.requestId++,
    ) : Promise<number> {
        if (accountIds === null || accountIds === "") {
            const allAccounts = await getAccounts({
                authConfig: this.authConfig,
                authConfigFileAccess: "NONE",
            });
            accountIds = allAccounts
                .map((acct: any) => {
                    const acctIds = [];
                    for (const acctLabel in acct) acctIds.push(acct[acctLabel].accountId);
                    return acctIds.join(",");
                })
                .join(",");
        }

        const streamKeyObj = await getStreamerSubKeys({
            accountIds: accountIds,
            authConfig: this.authConfig,
            authConfigFileAccess: "NONE",
        });

        const config : IGenericStreamConfig = {
            parameters: {
                keys: streamKeyObj.keys[0].key,
                fields: fields,
            },
            service: EServices.ACCT_ACTIVITY,
            command: ECommands.SUBS,
        };

        return await this.genericStreamRequest(config);
    }

    async accountActivityUnsub() : Promise<number> {
        const config : IGenericStreamConfig = {
            service: EServices.ACCT_ACTIVITY,
            command: ECommands.UNSUBS,
        };

        return await this.genericStreamRequest(config);
    }

    async queueAccountActivitySub(accountIds = "", fields = "0,1,2,3", requestSeqNum?: number, queueConfig: IQueueRequestConfig = {}) : Promise<any> {
        await this.qpush({
            fn: this.accountActivitySub.bind(this, accountIds, fields, requestSeqNum),
            fnDesc: "accountActivitySub",
            params: { accountIds, fields, requestSeqNum },
            queueRequestConfig: queueConfig,
        });
    }

    async queueAccountActivityUnsub(queueConfig: IQueueRequestConfig = {}) : Promise<any> {
        await this.qpush({
            fn: this.accountActivityUnsub.bind(this),
            fnDesc: "accountActivityUnsub",
            params: {},
            queueRequestConfig: queueConfig,
        });
    }

    async queueChartHistoryFuturesGet(
        config: IChartHistoryFuturesGetConfig,
        queueConfig: IQueueRequestConfig = {},
    ) : Promise<any> {
        // @ts-ignore
        await this.qpush({
            fn: this.chartHistoryFuturesGet.bind(this, config),
            fnDesc: "chartHistoryFuturesGet",
            params: config,
            queueRequestConfig: queueConfig,
        });
    }

    async queueGenericStreamRequest(config: IGenericStreamConfig, queueConfig: IQueueRequestConfig = {}): Promise<void> {
        await this.qpush({
            fn: this.genericStreamRequest.bind(this, config),
            fnDesc: "genericStreamRequest",
            params: config,
            queueRequestConfig: queueConfig,
        });
    }

    async queueQosRequest(qosLevel: EQosLevels, requestSeqNum: number = this.requestId++, queueConfig: IQueueRequestConfig = {}): Promise<void> {
        await this.qpush({
            fn: this.qosRequest.bind(this, qosLevel, requestSeqNum),
            fnDesc: "qosRequest",
            params: { qosLevel, requestSeqNum },
            queueRequestConfig: queueConfig,
        });
    }

    queueClear(): void {
        if (this.verbose) console.log("clear queue");
        this.queueArr = [];
    }
}

interface IQueueEntry {
    fn: any,
    fnDesc: string,
    params: any,
    queueRequestConfig: IQueueRequestConfig,
}

export interface IQueueRequestConfig {
    cbPre?: any,
    cbPost?: any,
}
