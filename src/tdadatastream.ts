import {IAuthConfig} from "./authentication";
import WebSocket from 'ws';
import moment from 'moment';
import {
    StreamingResponseData,
} from './streamingdatatypes';
import StreamingUtils from "./streamingutils";
import EventEmitter from 'events';
import {getStreamerSubKeys, getUserPrincipals} from "./userinfo";
import {getAccounts} from "./accounts";

export enum SERVICES {

    ADMIN = 'ADMIN',
    ACCT_ACTIVITY='ACCT_ACTIVITY',

    ACTIVES_NASDAQ='ACTIVES_NASDAQ',
    ACTIVES_NYSE='ACTIVES_NYSE',
    ACTIVES_OTCBB='ACTIVES_OTCBB',
    ACTIVES_OPTIONS='ACTIVES_OPTIONS',

    FOREX_BOOK='FOREX_BOOK',
    FUTURES_BOOK='FUTURES_BOOK',
    LISTED_BOOK='LISTED_BOOK',
    NASDAQ_BOOK='NASDAQ_BOOK',
    OPTIONS_BOOK='OPTIONS_BOOK',
    FUTURES_OPTIONS_BOOK='FUTURES_OPTIONS_BOOK',

    CHART_EQUITY='CHART_EQUITY',

    CHART_FUTURES = "CHART_FUTURES",
    CHART_HISTORY_FUTURES = 'CHART_HISTORY_FUTURES',
    QUOTE='QUOTE',
    LEVELONE_FUTURES = "LEVELONE_FUTURES",
    LEVELONE_FOREX = 'LEVELONE_FOREX',
    LEVELONE_FUTURES_OPTIONS='LEVELONE_FUTURES_OPTIONS',
    OPTION='OPTION',
    LEVELTWO_FUTURES='LEVELTWO_FUTURES',

    NEWS_HEADLINE='NEWS_HEADLINE',
    NEWS_STORY='NEWS_STORY',
    NEWS_HEADLINE_LIST='NEWS_HEADLINE_LIST',

    STREAMER_SERVER='STREAMER_SERVER',

    TIMESALE_EQUITY='TIMESALE_EQUITY',
    TIMESALE_FUTURES='TIMESALE_FUTURES',
    TIMESALE_FOREX='TIMESALE_FOREX',
    TIMESALE_OPTIONS='TIMESALE_OPTIONS',
}

export enum CHART_HISTORY_FUTURES_FREQUENCY {
    MINUTE_ONE='m1',
    MINUTE_FIVE='m5',
    MINUTE_TEN='m10',
    MINUTE_THIRTY='m30',
    HOUR_ONE='h1',
    DAY_ONE='d1',
    WEEK_ONE='w1',
    MONTH_ONE='n1',
}

export enum RESPONSE_CODES {
    ACCT_ACTIVITY='ACCT_ACTIVITY',
    ADMIN='ADMIN',
    ACTIVES_NASDAQ='ACTIVES_NASDAQ',
    ACTIVES_NYSE='ACTIVES_NYSE',
    ACTIVES_OTCBB='ACTIVES_OTCBB',
    ACTIVES_OPTIONS='ACTIVES_OPTIONS',
}

export enum COMMANDS {
    QOS="QOS",
    LOGIN='LOGIN',
    LOGOUT='LOGOUT',
    SUBS='SUBS',
    GET='GET',
    UNSUBS='UNSUBS',
    ADD='ADD',
    VIEW='VIEW',
    STREAM='STREAM',
}

export enum QOS_LEVELS {
    L0_EXPRESS_500MS = 0,
    L1_REALTIME_750MS = 1,
    L2_FAST_1000MS = 2,
    L3_MODERATE_1500MS = 3,
    L4_SLOW_3000MS = 4,
    L5_DELAYED_5000MS = 5,

}

export interface IStreamData {
    service: string,
    timestamp: number,
    command: string,
    content: any[]
}

export interface IStreamResponseContent {
    code: number,
    msg: string,
}

export interface IStreamResponse {
    service: string,
    requestid: string,
    command: string, // e.g. 'LOGIN', 'SUBS'
    timestamp: number,
    content: IStreamResponseContent,
}

export interface IStreamNotify {
    heartbeat: string, // timestamp as string
}

export interface IStreamConfig {
    authConfig?: IAuthConfig,

    emitDataRaw?: boolean,
    emitDataBySubRaw?: boolean,
    emitDataBySubTyped?: boolean,
    emitDataBySubAndTickerRaw?: boolean,
    emitDataBySubAndTickerTyped?: boolean,

    retryAttempts?: number,
    retryIntervalSeconds?: number,

    verbose?: boolean,
}

export interface IStreamParams {
    fields?: string,
    keys?: string,
    qoslevel?: QOS_LEVELS,
}

export interface GenericStreamConfig {
    service: SERVICES,
    command: COMMANDS,
    requestSeqNum?: number,
    account?: string,
    source?: string,
    parameters?: IStreamParams,
}

enum QueueState {
    INITIALIZED,
    AVAILABLE,
    BUSY,
}

export default class TDADataStream extends EventEmitter {
    private dataStreamSocket: any;
    private userKilled: boolean;
    private userPrincipalsResponse: any;
    private requestId: number;
    // @ts-ignore
    private streamLastAlive: number;

    readonly defaultFields: Map<string, string>;

    // internal state
    private subParams: {[index: string]: IStreamParams};
    // @ts-ignore
    private currentQosLevel: QOS_LEVELS;
    private retryAttemptTimeouts: any[];

    // internal queue
    private queueState: QueueState;
    private queueArr:  any[];

    // configurable
    private retryAttempts: number;
    private retryIntervalSeconds: number;
    private emitDataRaw: boolean;
    private emitDataBySubRaw: boolean;
    private emitDataBySubTyped: boolean;
    private emitDataBySubAndTickerRaw: boolean;
    private emitDataBySubAndTickerTyped: boolean;
    private verbose: boolean;
    private authConfig: IAuthConfig;

    constructor(streamConfig: IStreamConfig) {
        super();
        this.dataStreamSocket = {};
        this.userKilled = false;
        this.userPrincipalsResponse = {};
        this.requestId = 0;
        this.streamLastAlive = 0;

        this.defaultFields = TDADataStream.setDefaultFields();

        // internal state in case of restart
        this.subParams = {};
        this.currentQosLevel = QOS_LEVELS.L2_FAST_1000MS;
        this.retryAttemptTimeouts = [];

        // configurable
        this.retryAttempts = streamConfig.retryAttempts || 3;
        this.retryIntervalSeconds = streamConfig.retryIntervalSeconds || 60;
        this.emitDataRaw = streamConfig.emitDataRaw || false;
        this.emitDataBySubRaw = streamConfig.emitDataBySubRaw || false;
        this.emitDataBySubTyped = streamConfig.emitDataBySubTyped || false;
        this.emitDataBySubAndTickerRaw = streamConfig.emitDataBySubAndTickerRaw || false;
        this.emitDataBySubAndTickerTyped = streamConfig.emitDataBySubAndTickerTyped ?? true;
        this.verbose = streamConfig.verbose || false;
        if (streamConfig.authConfig != undefined)
            this.authConfig = streamConfig.authConfig;
        else throw 'You must provide authConfig as part of the config object in the constructor call.';

        this.queueState = QueueState.INITIALIZED;
        this.queueArr = [];

        this.qpush(this.genericStreamRequest.bind(this,{
            service: SERVICES.NEWS_HEADLINE,
            command: COMMANDS.SUBS,
            parameters: {
                keys: 'TSLA',
            }
        }));
    }

    private static setDefaultFields() : Map<string, string> {
        const defaultFields = new Map();
        defaultFields.set(SERVICES.CHART_FUTURES, StreamingUtils.buildNumberArray(0, 6));
        defaultFields.set(SERVICES.CHART_EQUITY, StreamingUtils.buildNumberArray(0, 8));
        defaultFields.set(SERVICES.CHART_HISTORY_FUTURES, StreamingUtils.buildNumberArray(0, 3));

        defaultFields.set(SERVICES.LEVELONE_FOREX, StreamingUtils.buildNumberArray(0, 29));
        defaultFields.set(SERVICES.LEVELONE_FUTURES, StreamingUtils.buildNumberArray(0, 35));
        defaultFields.set(SERVICES.LEVELONE_FUTURES_OPTIONS, StreamingUtils.buildNumberArray(0, 35));
        defaultFields.set(SERVICES.OPTION, StreamingUtils.buildNumberArray(0, 41));
        defaultFields.set(SERVICES.QUOTE, StreamingUtils.buildNumberArray(0, 52));

        defaultFields.set(SERVICES.TIMESALE_EQUITY, StreamingUtils.buildNumberArray(0, 4));
        defaultFields.set(SERVICES.TIMESALE_OPTIONS, StreamingUtils.buildNumberArray(0, 4));
        defaultFields.set(SERVICES.TIMESALE_FUTURES, StreamingUtils.buildNumberArray(0, 4));
        defaultFields.set(SERVICES.TIMESALE_FOREX, StreamingUtils.buildNumberArray(0, 4));

        defaultFields.set(SERVICES.NEWS_HEADLINE, StreamingUtils.buildNumberArray(0, 10));
        defaultFields.set(SERVICES.NEWS_HEADLINE_LIST, StreamingUtils.buildNumberArray(0, 10));
        defaultFields.set(SERVICES.NEWS_STORY, StreamingUtils.buildNumberArray(0, 10));

        defaultFields.set(SERVICES.ACCT_ACTIVITY, StreamingUtils.buildNumberArray(0, 3));

        defaultFields.set(SERVICES.FUTURES_BOOK, StreamingUtils.buildNumberArray(0, 50));
        defaultFields.set(SERVICES.FOREX_BOOK, StreamingUtils.buildNumberArray(0, 50));
        defaultFields.set(SERVICES.FUTURES_OPTIONS_BOOK, StreamingUtils.buildNumberArray(0, 50));
        defaultFields.set(SERVICES.LISTED_BOOK, StreamingUtils.buildNumberArray(0, 50));
        defaultFields.set(SERVICES.NASDAQ_BOOK, StreamingUtils.buildNumberArray(0, 50));
        defaultFields.set(SERVICES.OPTIONS_BOOK, StreamingUtils.buildNumberArray(0, 50));

        return defaultFields;

    }

    setConfig(config: IStreamConfig) : void {
        this.emitDataRaw = config.emitDataRaw != undefined ? config.emitDataRaw : this.emitDataRaw;
        this.emitDataBySubRaw = config.emitDataBySubRaw != undefined ? config.emitDataBySubRaw : this.emitDataBySubRaw;
        this.emitDataBySubTyped = config.emitDataBySubTyped != undefined ? config.emitDataBySubTyped : this.emitDataBySubTyped;
        this.emitDataBySubAndTickerRaw = config.emitDataBySubAndTickerRaw != undefined ? config.emitDataBySubAndTickerRaw : this.emitDataBySubAndTickerRaw;
        this.emitDataBySubAndTickerTyped = config.emitDataBySubAndTickerTyped != undefined ? config.emitDataBySubAndTickerTyped : this.emitDataBySubAndTickerTyped;
        this.retryAttempts = config.retryAttempts !| this.retryAttempts;
        this.retryIntervalSeconds = config.retryIntervalSeconds || this.retryIntervalSeconds;
        this.verbose = config.verbose || false;
    }

    getConfig() : IStreamConfig {
        return {
            emitDataRaw: this.emitDataRaw,
            emitDataBySubRaw: this.emitDataBySubRaw,
            emitDataBySubTyped: this.emitDataBySubTyped,
            emitDataBySubAndTickerRaw: this.emitDataBySubAndTickerRaw,
            emitDataBySubAndTickerTyped: this.emitDataBySubAndTickerTyped,
            retryAttempts: this.retryAttempts,
            retryIntervalSeconds: this.retryIntervalSeconds,
        }
    }

    private getDefaultFields(service: SERVICES): string {
        if (this.defaultFields.has(service)) {
            // @ts-ignore
            return this.defaultFields.get(service);
        } else return '';
    }

    private handleIncomingData(element: StreamingResponseData, emitEventBase: string, mappingFunction: any) {
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
            if (this.verbose) console.log('typed');
            const typedResponses: any[] = element.content.map((item: any) => mappingFunction(item, element.timestamp));
            if (this.emitDataBySubTyped) {
                this.emit(`${emitEventBase}_TYPED`, typedResponses);
            }
            if (this.emitDataBySubAndTickerTyped && typedResponses) {
                typedResponses.forEach(item => this.emit(`${emitEventBase}_TYPED_${StreamingUtils.normalizeSymbol(item.key)}`, item));
            }
        }
    }

    private async handleIncoming(resp: string, resolve: any) {
        // console.log('handle incoming');
        this.streamLastAlive = moment.utc().valueOf();
        const respObj = JSON.parse(resp);
        if (this.verbose) {
            console.log('handle incoming: ' + Object.keys(respObj).join(','));
            console.log(JSON.stringify(respObj, null, 2));
        }

        if (respObj.notify) {
            if (this.verbose) console.log(respObj.notify);
            this.emit('heartbeat', respObj.notify as IStreamNotify[]);
        }

        // such as in the case of acknowledging connection or new subscription or qos change
        if (respObj.response) {
            if (this.queueState === QueueState.INITIALIZED) {
                await this.qstart();
            } else {
                this.queueState = QueueState.AVAILABLE;
                await this.dequeueAndProcess();
            }
            if (this.verbose) console.log(respObj.response);
            this.emit('response', respObj.response);

            // case 5.7 service === 'ADMIN' && command === 'QOS'
            // case 5.5 service === 'ADMIN' && command === 'LOGOUT'
            // case 5.3 service === 'ADMIN' && command === 'LOGIN'
        }

        if (respObj.data) {
            if (this.emitDataRaw) {
                this.emit('data', respObj.data);
            }
            respObj.data.forEach((element: StreamingResponseData) => {
                let fn = null;
                switch (element.service) {
                    case SERVICES.LEVELONE_FUTURES: fn = StreamingUtils.transformL1FuturesResponse; break;
                    case SERVICES.LEVELONE_FUTURES_OPTIONS: fn = StreamingUtils.transformL1FuturesOptionsResponse; break;
                    case SERVICES.LEVELONE_FOREX: fn = StreamingUtils.transformL1ForexResponse; break;
                    case SERVICES.QUOTE: fn = StreamingUtils.transformL1EquitiesResponse; break;
                    case SERVICES.OPTION: fn = StreamingUtils.transformL1OptionsResponse; break;
                    case SERVICES.CHART_EQUITY: fn = StreamingUtils.transformEquityChartResponse; break;
                    case SERVICES.CHART_FUTURES: fn = StreamingUtils.transformFuturesChartResponse; break;
                    case SERVICES.CHART_HISTORY_FUTURES: fn = StreamingUtils.transformChartHistoryFuturesResponse; break;
                    case SERVICES.NEWS_HEADLINE: fn = StreamingUtils.transformNewsHeadlineResponse; break;
                    case SERVICES.ACCT_ACTIVITY: fn = StreamingUtils.transformAcctActivityResponse; break;
                    case SERVICES.TIMESALE_FOREX:
                    case SERVICES.TIMESALE_FUTURES:
                    case SERVICES.TIMESALE_OPTIONS:
                    case SERVICES.TIMESALE_EQUITY: fn = StreamingUtils.transformTimeSaleResponse; break;
                    case SERVICES.NEWS_STORY:
                    case SERVICES.NEWS_HEADLINE_LIST:
                    case SERVICES.FUTURES_BOOK:
                    case SERVICES.OPTIONS_BOOK:
                    case SERVICES.NASDAQ_BOOK:
                    case SERVICES.FOREX_BOOK:
                    case SERVICES.FUTURES_OPTIONS_BOOK:
                    case SERVICES.LISTED_BOOK: fn = StreamingUtils.identityFunction; break;
                    default: break;
                }
                if (fn != null) {
                    this.handleIncomingData(element, element.service, fn);
                }
            });
        }

        if (respObj.snapshot) {
            this.queueState = QueueState.AVAILABLE;
            await this.dequeueAndProcess();

            if (this.emitDataRaw) {
                this.emit('snapshot', respObj.snapshot);
            }
            respObj.snapshot.forEach((element: StreamingResponseData) => {
                if (this.verbose) console.log(`service is ${element.service} and is that CHF? ${element.service === SERVICES.CHART_HISTORY_FUTURES}`);
                // this.handleIncomingData(element, element.service, StreamingUtils.transformChartHistoryFuturesResponse);
                let fn = null;
                switch (element.service) {
                    case SERVICES.CHART_HISTORY_FUTURES: fn = StreamingUtils.transformChartHistoryFuturesResponse; break;
                    default: fn = () => {}; break;
                }
                if (fn != null) {
                    this.handleIncomingData(element, element.service, fn);
                }
            });
        }
    }

    private handleParamStorage(config: GenericStreamConfig) {
        // handle param storage
        if (!config.service || [SERVICES.ADMIN, SERVICES.CHART_HISTORY_FUTURES].includes(config.service)) return;
        const currentParams = this.subParams[config.service];
        if (config.command === COMMANDS.SUBS) {
            // overwrite
            this.subParams[config.service] = {
                ...config.parameters
            };
        } else if (config.command === COMMANDS.ADD) {
            // superset
            const keys = new Set();
            config.parameters?.keys?.split(',').forEach((k: string) => {
                keys.add(k);
            });
            this.subParams[config.service]?.keys?.split(',').forEach((k: string) => {
                keys.add(k);
            });
            const fields = new Set();
            config.parameters?.fields?.split(',').forEach((k: string) => {
                fields.add(k);
            });
            this.subParams[config.service]?.fields?.split(',').forEach((k: string) => {
                fields.add(k);
            });
            this.subParams[config.service] = {
                keys: Array.from(keys).join(','),
                fields: Array.from(fields).join(',')
            };
        } else if (config.command === COMMANDS.UNSUBS) {
            // if there are keys, that means the unsub is selective
            if (config.parameters?.keys) {
                const keys = new Set();
                this.subParams[config.service]?.keys?.split(',').forEach((k: string) => {
                    keys.add(k);
                });
                config.parameters?.keys?.split(',').forEach((k: string) => {
                    keys.delete(k);
                });
                this.subParams[config.service] = {
                    ...currentParams,
                    keys: Array.from(keys).join(',')
                }
            } else {
                this.subParams[config.service] = {};
            }
        }
    }

    /**
     * A method to do stuff.
     * @param {object} config
     * @param {SERVICES} config.service - use the SERVICES enum
     * @param {COMMANDS} config.command - use the COMMANDS enum
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
    async genericStreamRequest(config: GenericStreamConfig) : Promise<number> {
        if (!config) throw 'You must pass in a config object';
        let {service, command, requestSeqNum, parameters, account, source} = config;
        if ([COMMANDS.SUBS, COMMANDS.ADD].includes(command)) {
            if (!parameters || !parameters.keys) throw 'With commands ADD or SUBS, your config object must have parameters';
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
                }
            ]
        };
        this.dataStreamSocket.send(JSON.stringify(request));
        return requestSeqNum;
    }

    private resubscribe() {
        for (const service in this.subParams) {
            const params = this.subParams[service];
            const input = {
                service: service,
                command: COMMANDS.SUBS,
                requestSeqNum: this.requestId++,
                parameters: params,
            }
            this.genericStreamRequest(input as GenericStreamConfig);
        }
    }

    // called after connect success, and OPEN event received; do login, then something to keep stream alive
    private async open(loginRequest: any) {
        this.dataStreamSocket.send(JSON.stringify(loginRequest));
    }

    private async restartDataStream() {
        this.once('message', () => { this.clearRetryAttempts(); this.resubscribe() }); // set this to trigger on successful login
        for (let i = 0; i < this.retryAttempts; i++) {
            this.retryAttemptTimeouts.push(setTimeout(() => this.doDataStreamLogin(), this.retryIntervalSeconds*i*1000));
        }
    }

    private clearRetryAttempts() {
        this.retryAttemptTimeouts.forEach(t => clearTimeout(t));
    }

    private async handleStreamClose() {
        if (this.userKilled) {
            if (this.verbose) console.log('stream closed, killed by user');
            this.emit('streamClosed', {attemptingReconnect: false});
        }
        else {
            if (this.verbose) console.log('stream closed, not killed by user, attempting restart');
            this.emit('streamClosed', {attemptingReconnect: true});
            // attempt to reconnect
            await this.restartDataStream();
        }
        return Promise.resolve();
    }

    async doDataStreamLogin(
        fields: string = 'streamerSubscriptionKeys,streamerConnectionInfo,preferences,surrogateIds',
        qosLevel: QOS_LEVELS = QOS_LEVELS.L2_FAST_1000MS
    ) : Promise<any> {
        // if now is within 30 seconds of last alive, do nothing
        this.userKilled = false;
        if (this.verbose) console.log('doDataStreamLogin');
        this.userPrincipalsResponse = await getUserPrincipals({fields: fields, authConfig: this.authConfig});
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
            "acl": this.userPrincipalsResponse.streamerInfo.acl
        }

        const loginRequest = {
            "requests": [
                {
                    "service": SERVICES.ADMIN,
                    "command": COMMANDS.LOGIN,
                    "requestid": `${this.requestId++}`,
                    "account": this.userPrincipalsResponse.accounts[0].accountId,
                    "source": this.userPrincipalsResponse.streamerInfo.appId,
                    "parameters": {
                        "credential": StreamingUtils.jsonToQueryString(credentials),
                        "token": this.userPrincipalsResponse.streamerInfo.token,
                        "version": "1.0",
                        "qoslevel": `${qosLevel}`
                    }
                }
            ]
        };

        return new Promise((resolve, reject) => {
            this.dataStreamSocket = new WebSocket("wss://" + this.userPrincipalsResponse.streamerInfo.streamerSocketUrl + "/ws");

            this.dataStreamSocket.on('message', (resp: string) => this.handleIncoming.call(this, resp, resolve));

            this.dataStreamSocket.on('close', () => this.handleStreamClose.bind(this));

            this.dataStreamSocket.on('open', () => this.open.call(this, loginRequest));
        });
    }

    /**
     * After calling this, wait for the emitting event 'streamClosed' with {attemptingReconnect: false}
     */
    async doDataStreamLogout() {
        this.userKilled = true;
        await this.genericStreamRequest({
            service: SERVICES.ADMIN,
            requestSeqNum: this.requestId++,
            command: COMMANDS.LOGOUT,
            parameters: {}
        });
    }

    /**
     * Subscribe to real-time data updates on specified futures symbols.
     * Each subsequent call overrides the previous, so (1) /NQ then (2) /ES will result in just /ES.
     * With the second request you'd need to pass in "/NQ,/ES"
     * Can use format /ES or a specific contract /ESM21
     * @param {QOS_LEVELS} qosLevel - comma-separated symbols, e.g. "/NQ,/ES"
     * @param requestSeqNum {number} - defaulted to an incrementing integer
     * @returns A Promise with the request sequence number, 0 if error
     * @async
     */
    async qosRequest(qosLevel: QOS_LEVELS, requestSeqNum: number = this.requestId++) : Promise<number> {
        if (!QOS_LEVELS[qosLevel]) return 0;
        this.currentQosLevel = qosLevel;
        return this.genericStreamRequest({
            service: SERVICES.ADMIN,
            requestSeqNum,
            command: COMMANDS.QOS,
            parameters: {
                qoslevel: qosLevel
            }
        });

    }


    /**
     * Get historical candles for futures. Specify period OR (startTimeMSEpoch and endTimeMSEpoch)
     *
     * @param {string} symbol - Futures symbol, such as "/ES" or "/ESM21"
     * @param {CHART_HISTORY_FUTURES_FREQUENCY} frequency - Choose the candle size for the historical data. Choices: m1, m5, m10, m30, h1, d1, w1, n1 (m=minute, h=hour, d=day, w=week, n=month)
     * @param {string} [period] - (Optional / REQURIED if no start/end time) Specify period with a string such as d5, w4, n10, y1, y10 (d=day, w=week, n=month, y=year)
     * @param {number} [startTimeMSEpoch] - (Optional / REQUIRED if no period) A number representing the time in milliseconds since epoch.
     * @param {number} [endTimeMSEpoch] - (Optional / REQUIRED if no period) A number representing the time in milliseconds since epoch.
     * @param {number} [requestSeqNum] - (Optional) The sequence number for the request, default is the class counter
     * @returns A Promise with the request sequence number, 0 if error
     * @async
     */
    async chartHistoryFuturesGet(symbol: string,
                                 frequency: CHART_HISTORY_FUTURES_FREQUENCY,
                                 period?: string,
                                 startTimeMSEpoch?: number,
                                 endTimeMSEpoch?: number,
                                 requestSeqNum: number = this.requestId++
    ) : Promise<number> {
        if (!period && (!startTimeMSEpoch || !endTimeMSEpoch)) return 0;

        const request = {
            "requests": [
                {
                    "service": SERVICES.CHART_HISTORY_FUTURES,
                    "requestid": `${requestSeqNum}`,
                    "command": COMMANDS.GET,
                    "account": this.userPrincipalsResponse.accounts[0].accountId,
                    "source": this.userPrincipalsResponse.streamerInfo.appId,
                    "parameters": {
                        "symbol": symbol,
                        "frequency": frequency,
                        "period": period,
                        "START_TIME": startTimeMSEpoch,
                        "END_TIME": endTimeMSEpoch,
                    }
                }
            ]
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
    async accountUpdatesSub(accountIds: string = '', fields: string = "0,1,2,3", requestSeqNum: number = this.requestId++) : Promise<number> {
        if (accountIds === null || accountIds === '') {
            const allAccounts = await getAccounts({});
            accountIds = allAccounts
                .map((acct: any) => {
                    let acctIds = [];
                    for (const acctLabel in acct) acctIds.push(acct[acctLabel].accountId);
                    return acctIds.join(',');
                })
                .join(',');
        }

        const streamKeyObj = await getStreamerSubKeys({
            accountIds: accountIds,
            authConfig: this.authConfig,
        });

        const config : GenericStreamConfig = {
            parameters: {
                keys: streamKeyObj.keys[0].key,
                fields: fields,
            },
            service: SERVICES.ACCT_ACTIVITY,
            command: COMMANDS.SUBS
        }

        return this.genericStreamRequest(config);
    }

    private async qstart() {
        this.queueState = QueueState.AVAILABLE;
        await this.dequeueAndProcess();
    }

    private async qpush(cb:any) {
        this.queueArr.push(cb);
        if (this.queueArr.length === 1 && this.queueState === QueueState.AVAILABLE) {
            await this.dequeueAndProcess();
        }
    }

    private async dequeueAndProcess() {
        if (this.verbose) console.log('deq', `queuesize:${this.queueArr.length}`, `queuestate:${QueueState[this.queueState]}`);
        if (this.queueArr.length > 0 && this.queueState === QueueState.AVAILABLE) {
            this.queueState = QueueState.BUSY;
            const nextInQueue = this.queueArr.pop();
            await nextInQueue();
        }
    }

    async qaccountUpdatesSub(accountIds: string = '', fields: string = "0,1,2,3", requestSeqNum?: number) : Promise<any> {
        await this.qpush(this.accountUpdatesSub.bind(this, accountIds, fields, requestSeqNum));
    }

    async qchartHistoryFuturesGet(
        symbol: string,
        frequency: CHART_HISTORY_FUTURES_FREQUENCY,
        period?: string,
        startTimeMSEpoch?: number,
        endTimeMSEpoch?: number,
        requestSeqNum?: number
    ) : Promise<any> {
        // @ts-ignore
        await this.qpush(this.chartHistoryFuturesGet.bind(this, symbol, frequency, period, startTimeMSEpoch, endTimeMSEpoch, requestSeqNum));
    }

    async qgenericStreamRequest(config: GenericStreamConfig) {
        await this.qpush(this.genericStreamRequest.bind(this, config));
    }
    
}


