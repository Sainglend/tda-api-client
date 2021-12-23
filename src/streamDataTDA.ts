import {IAuthConfig} from "./tdapiinterface";
import WebSocket from "ws";
import moment from "moment";
import {StreamingResponseData} from "./streamingdatatypes";
import StreamingUtils from "./streamingutils";
import EventEmitter from "events";
import {EUserPrincipalFields, getStreamerSubKeys, getUserPrincipals} from "./userinfo";
import {getAccounts} from "./accounts";

export enum EServices {
    ADMIN = "ADMIN",
    ACCT_ACTIVITY="ACCT_ACTIVITY",

    ACTIVES_NASDAQ="ACTIVES_NASDAQ",
    ACTIVES_NYSE="ACTIVES_NYSE",
    ACTIVES_OTCBB="ACTIVES_OTCBB",
    ACTIVES_OPTIONS="ACTIVES_OPTIONS",

    FOREX_BOOK="FOREX_BOOK",
    FUTURES_BOOK="FUTURES_BOOK",
    LISTED_BOOK="LISTED_BOOK",
    NASDAQ_BOOK="NASDAQ_BOOK",
    OPTIONS_BOOK="OPTIONS_BOOK",
    FUTURES_OPTIONS_BOOK="FUTURES_OPTIONS_BOOK",

    CHART_EQUITY="CHART_EQUITY",

    CHART_FUTURES = "CHART_FUTURES",
    CHART_HISTORY_FUTURES = "CHART_HISTORY_FUTURES",
    QUOTE="QUOTE",
    LEVELONE_FUTURES = "LEVELONE_FUTURES",
    LEVELONE_FOREX = "LEVELONE_FOREX",
    LEVELONE_FUTURES_OPTIONS="LEVELONE_FUTURES_OPTIONS",
    OPTION="OPTION",
    LEVELTWO_FUTURES="LEVELTWO_FUTURES",

    NEWS_HEADLINE="NEWS_HEADLINE",
    NEWS_STORY="NEWS_STORY",
    NEWS_HEADLINE_LIST="NEWS_HEADLINE_LIST",

    STREAMER_SERVER="STREAMER_SERVER",

    TIMESALE_EQUITY="TIMESALE_EQUITY",
    TIMESALE_FUTURES="TIMESALE_FUTURES",
    TIMESALE_FOREX="TIMESALE_FOREX",
    TIMESALE_OPTIONS="TIMESALE_OPTIONS",
}

export enum EChartHistoryFuturesFrequency {
    MINUTE_ONE="m1",
    MINUTE_FIVE="m5",
    MINUTE_TEN="m10",
    MINUTE_THIRTY="m30",
    HOUR_ONE="h1",
    DAY_ONE="d1",
    WEEK_ONE="w1",
    MONTH_ONE="n1",
}

export enum EResponseCodes {
    ACCT_ACTIVITY="ACCT_ACTIVITY",
    ADMIN="ADMIN",
    ACTIVES_NASDAQ="ACTIVES_NASDAQ",
    ACTIVES_NYSE="ACTIVES_NYSE",
    ACTIVES_OTCBB="ACTIVES_OTCBB",
    ACTIVES_OPTIONS="ACTIVES_OPTIONS",
}

export enum ECommands {
    QOS="QOS",
    LOGIN="LOGIN",
    LOGOUT="LOGOUT",
    SUBS="SUBS",
    GET="GET",
    UNSUBS="UNSUBS",
    ADD="ADD",
    VIEW="VIEW",
    STREAM="STREAM",
}

export enum EQosLevels {
    L0_EXPRESS_500MS = 0,
    L1_REALTIME_750MS = 1,
    L2_FAST_1000MS = 2,
    L3_MODERATE_1500MS = 3,
    L4_SLOW_3000MS = 4,
    L5_DELAYED_5000MS = 5,
}

export interface IStreamNotify {
    heartbeat: string, // timestamp as string
}

export interface IStreamDataTDAConfig {
    authConfig?: IAuthConfig,

    emitDataRaw?: boolean,
    emitDataBySubRaw?: boolean,
    emitDataBySubTyped?: boolean,
    emitDataBySubAndTickerRaw?: boolean,
    emitDataBySubAndTickerTyped?: boolean,

    reconnectRetryIntervalSeconds?: number,

    verbose?: boolean,
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
    INITIALIZED,
    AVAILABLE,
    BUSY,
}

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
    private authConfig: IAuthConfig;

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
        if (streamConfig.authConfig != undefined)
            this.authConfig = streamConfig.authConfig;
        else throw "You must provide authConfig as part of the config object in the constructor call.";

        this.queueState = EQueueState.INITIALIZED;
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

    setConfig(config: IStreamDataTDAConfig): void {
        this.emitDataRaw = config.emitDataRaw != undefined ? config.emitDataRaw : this.emitDataRaw;
        this.emitDataBySubRaw = config.emitDataBySubRaw != undefined ? config.emitDataBySubRaw : this.emitDataBySubRaw;
        this.emitDataBySubTyped = config.emitDataBySubTyped != undefined ? config.emitDataBySubTyped : this.emitDataBySubTyped;
        this.emitDataBySubAndTickerRaw = config.emitDataBySubAndTickerRaw != undefined ? config.emitDataBySubAndTickerRaw : this.emitDataBySubAndTickerRaw;
        this.emitDataBySubAndTickerTyped = config.emitDataBySubAndTickerTyped != undefined ? config.emitDataBySubAndTickerTyped : this.emitDataBySubAndTickerTyped;
        this.retryIntervalSeconds = config.reconnectRetryIntervalSeconds || this.retryIntervalSeconds;
        this.verbose = config.verbose || false;
    }

    getConfig(): IStreamDataTDAConfig {
        return {
            emitDataRaw: this.emitDataRaw,
            emitDataBySubRaw: this.emitDataBySubRaw,
            emitDataBySubTyped: this.emitDataBySubTyped,
            emitDataBySubAndTickerRaw: this.emitDataBySubAndTickerRaw,
            emitDataBySubAndTickerTyped: this.emitDataBySubAndTickerTyped,
            reconnectRetryIntervalSeconds: this.retryIntervalSeconds,
        };
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
            this.emit(`${emitEventBase}_RAW`, element.content);
        }
        if (this.emitDataBySubAndTickerRaw) {
            element.content.forEach((item: any) => {
                this.emit(`${emitEventBase}_RAW_${StreamingUtils.normalizeSymbol(item.key)}`, item);
            });
        }

        if (this.emitDataBySubAndTickerTyped || this.emitDataBySubTyped) {
            if (this.verbose) console.log("typed");
            const typedResponses: any[] = element.content.map((item: any) => mappingFunction(item, element.timestamp));
            if (this.emitDataBySubTyped) {
                this.emit(`${emitEventBase}_TYPED`, typedResponses);
            }
            if (this.emitDataBySubAndTickerTyped && typedResponses) {
                typedResponses.forEach(item => this.emit(`${emitEventBase}_TYPED_${StreamingUtils.normalizeSymbol(item.key)}`, item));
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
            if (this.verbose) console.log(responseObject.notify);
            this.emit("heartbeat", responseObject.notify as IStreamNotify[]);
        }

        // such as in the case of acknowledging connection or new subscription or qos change
        if (responseObject.response) {
            if (!this.heartbeatCheckerInterval) this.heartbeatCheckerInterval = this.startHeartbeatChecker();
            if (this.queueState === EQueueState.INITIALIZED) {
                await this.qstart();
            } else {
                this.queueState = EQueueState.AVAILABLE;
                await this.dequeueAndProcess();
            }
            if (this.verbose) console.log(responseObject.response);
            this.emit("response", responseObject.response);

            // case 5.7 service === 'ADMIN' && command === 'QOS'
            // case 5.5 service === 'ADMIN' && command === 'LOGOUT'
            // case 5.3 service === 'ADMIN' && command === 'LOGIN'
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
                case EServices.CHART_HISTORY_FUTURES: fn = StreamingUtils.transformChartHistoryFuturesResponse; break;
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
            await this.dequeueAndProcess();

            if (this.emitDataRaw) {
                this.emit("snapshot", responseObject.snapshot);
            }
            responseObject.snapshot.forEach((element: StreamingResponseData) => {
                if (this.verbose) console.log(`service is ${element.service} and is that CHF? ${element.service === EServices.CHART_HISTORY_FUTURES}`);
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
            clearInterval(this.heartbeatCheckerInterval);
        }
        this.once("message", () => { this.clearRetryAttempts(); this.resubscribe(); }); // set this to trigger on successful login
        this.doDataStreamLogin();
    }

    private clearRetryAttempts() {
        this.connectionRetryAttemptTimeouts.forEach(t => clearTimeout(t));
    }

    private async handleStreamClose(): Promise<void> {
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

            this.dataStreamSocket.on("close", () => this.handleStreamClose.bind(this));

            this.dataStreamSocket.on("open", () => this.open.call(this, loginRequest));
        });
    }

    /**
     * After calling this, wait for the emitting event 'streamClosed' with {attemptingReconnect: false}
     */
    async doDataStreamLogout(): Promise<void> {
        this.userKilled = true;
        await this.genericStreamRequest({
            service: EServices.ADMIN,
            requestSeqNum: this.requestId++,
            command: ECommands.LOGOUT,
            parameters: {},
        });
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
    async chartHistoryFuturesGet(symbol: string,
        frequency: EChartHistoryFuturesFrequency,
        period?: string,
        startTimeMSEpoch?: number,
        endTimeMSEpoch?: number,
        requestSeqNum: number = this.requestId++,
    ) : Promise<number> {
        if (!period && (!startTimeMSEpoch || !endTimeMSEpoch)) return 0;

        const request = {
            "requests": [
                {
                    "service": EServices.CHART_HISTORY_FUTURES,
                    "requestid": `${requestSeqNum}`,
                    "command": ECommands.GET,
                    "account": this.userPrincipalsResponse.accounts[0].accountId,
                    "source": this.userPrincipalsResponse.streamerInfo.appId,
                    "parameters": {
                        "symbol": symbol,
                        "frequency": frequency,
                        "period": period,
                        "START_TIME": startTimeMSEpoch,
                        "END_TIME": endTimeMSEpoch,
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
     * @returns A Promise with the request sequence number, 0 if error
     * @async
     */
    async accountUpdatesSub(accountIds = "", fields = "0,1,2,3", requestSeqNum: number = this.requestId++) : Promise<number> {
        if (accountIds === null || accountIds === "") {
            const allAccounts = await getAccounts({});
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

    private async qstart() {
        this.queueState = EQueueState.AVAILABLE;
        await this.dequeueAndProcess();
    }

    private async qpush(cb:any) {
        this.queueArr.push(cb);
        if (this.queueArr.length === 1 && this.queueState === EQueueState.AVAILABLE) {
            await this.dequeueAndProcess();
        }
    }

    private async dequeueAndProcess() {
        if (this.verbose) console.log("deq", `queuesize:${this.queueArr.length}`, `queuestate:${EQueueState[this.queueState]}`);
        if (this.queueArr.length > 0 && this.queueState === EQueueState.AVAILABLE) {
            this.queueState = EQueueState.BUSY;
            const nextInQueue = this.queueArr.pop();
            await nextInQueue();
        }
    }

    async queueAccountUpdatesSub(accountIds = "", fields = "0,1,2,3", requestSeqNum?: number) : Promise<any> {
        await this.qpush(this.accountUpdatesSub.bind(this, accountIds, fields, requestSeqNum));
    }

    async queueChartHistoryFuturesGet(
        symbol: string,
        frequency: EChartHistoryFuturesFrequency,
        period?: string,
        startTimeMSEpoch?: number,
        endTimeMSEpoch?: number,
        requestSeqNum?: number,
    ) : Promise<any> {
        // @ts-ignore
        await this.qpush(this.chartHistoryFuturesGet.bind(this, symbol, frequency, period, startTimeMSEpoch, endTimeMSEpoch, requestSeqNum));
    }

    async queueGenericStreamRequest(config: IGenericStreamConfig): Promise<void> {
        await this.qpush(this.genericStreamRequest.bind(this, config));
    }
}
