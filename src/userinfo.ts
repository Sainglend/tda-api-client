// Copyright (C) 2020-2 Aaron Satterlee

import {apiGet, apiPut, IWriteResponse, TacRequestConfig} from "./tdapiinterface";

export enum EPrefOrderLegInstruction {
    BUY = "BUY",
    SELL = "SELL",
    BUY_TO_COVER = "BUY_TO_COVER",
    SELL_SHORT = "SELL_SHORT",
    NONE = "NONE",
}

export enum EPrefPriceLinkType {
    VALUE = "VALUE",
    PERCENT = "PERCENT",
    NONE = "NONE",
}

export enum EPrefOrderDuration {
    DAY = "DAY",
    GOOD_TILL_CANCEL = "GOOD_TILL_CANCEL",
    NONE = "NONE",
}

export enum EPrefOrderType {
    MARKET = "MARKET",
    LIMIT = "LIMIT",
    STOP = "STOP",
    STOP_LIMIT = "STOP_LIMIT",
    TRAILING_STOP = "TRAILING_STOP",
    MARKET_ON_CLOSE = "MARKET_ON_CLOSE",
    NONE = "NONE",
}

export enum EPrefMarketSession {
    AM = "AM",
    PM = "PM",
    NORMAL = "NORMAL",
    SEAMLESS = "SEAMLESS",
    NONE = "NONE",
}

export enum EPrefTaxLotMethod {
    FIFO = "FIFO",
    LIFO = "LIFO",
    HIGH_COST = "HIGH_COST",
    LOW_COST = "LOW_COST",
    MINIMUM_TAX = "MINIMUM_TAX",
    AVERAGE_COST = "AVERAGE_COST",
    NONE = "NONE",
}

export enum EPrefAdvancedToolLaunch {
    TA = "TA",
    N = "N",
    Y = "Y",
    TOS = "TOS",
    CC2 = "CC2",
    NONE = "NONE",
}

export enum EPrefAuthTokenTimeout {
    FIFTY_FIVE_MINUTES = "FIFTY_FIVE_MINUTES",
    TWO_HOURS = "TWO_HOURS",
    FOUR_HOURS = "FOUR_HOURS",
    EIGHT_HOURS = "EIGHT_HOURS",
}

export interface IPreferences extends IPreferencesUpdate {
    directOptionsRouting: boolean,
    directEquityRouting: boolean,
}

export interface IPreferencesUpdate {
    expressTrading: boolean,
    defaultEquityOrderLegInstruction: EPrefOrderLegInstruction,
    defaultEquityOrderType: EPrefOrderType,
    defaultEquityOrderPriceLinkType: EPrefPriceLinkType,
    defaultEquityOrderDuration: EPrefOrderDuration,
    defaultEquityOrderMarketSession: EPrefMarketSession,
    defaultEquityQuantity: number,
    mutualFundTaxLotMethod: EPrefTaxLotMethod,
    optionTaxLotMethod: EPrefTaxLotMethod,
    equityTaxLotMethod: EPrefTaxLotMethod,
    defaultAdvancedToolLaunch: EPrefAdvancedToolLaunch,
    authTokenTimeout: EPrefAuthTokenTimeout,
}

export interface IGetUserPreferencesConfig extends TacRequestConfig {
    accountId: string | number,
}

export interface IGetStreamerKeysConfig extends TacRequestConfig {
    accountIds?: string,
}

export interface ISubKey {
    key: string,
}

export interface IStreamerSubKeys {
    keys: ISubKey[],
}

export interface IStreamerInfo {
    streamerBinaryUrl: string,
    streamerSocketUrl: string,
    token: string,
    tokenTimestamp: string,
    userGroup: string,
    accessLevel: string,
    acl: string,
    appId: string,
}

export enum EProfessionalStatus {
    PROFESSIONAL = "PROFESSIONAL",
    NON_PROFESSIONAL = "NON_PROFESSIONAL",
    UNKNOWN_STATUS = "UNKNOWN_STATUS",
}

export interface IQuotesTiming {
    isNyseDelayed: boolean,
    isNasdaqDelayed: boolean,
    isOpraDelayed: boolean,
    isAmexDelayed: boolean,
    isCmeDelayed: boolean,
    isIceDelayed: boolean,
    isForexDelayed: boolean,
}

export interface IUserAccountSummmary {
    accountId: string,
    description: string,
    displayName: string,
    accountCdDomainId: string,
    company: string,
    segment: string,
    surrogateIds: {[index:string]: string},
    preferences: IPreferences,
    acl: string,
    authorizations: IAccountAuthorizations,
}

export interface IAccountAuthorizations {
    apex: boolean,
    levelTwoQuotes: boolean,
    stockTrading: boolean,
    marginTrading: boolean,
    streamingNews: boolean,
    streamerAccess: boolean,
    advancedMargin: boolean,
    scottradeAccount: boolean,
    optionTradingLevel: EOptionsTradingLevel,
}

export enum EOptionsTradingLevel {
    NONE = "NONE",
    COVERED = "COVERED",
    LONG = "LONG",
    SPREAD = "SPREAD",
    FULL = "FULL",
}

export interface IUserPrincipal {
    authToken: string,
    userId: string,
    userCdDomainId: string,
    primaryAccountId: string,
    lastLoginTime: string,
    tokenExpirationTime: string,
    loginTime: string,
    accessLevel: string,
    stalePassword: boolean,
    streamerInfo: IStreamerInfo,
    professionalStatus: EProfessionalStatus,
    quotes: IQuotesTiming,
    streamerSubscriptionKeys: IStreamerSubKeys,
    accounts: IUserAccountSummmary[],
}

export interface IGetUserPrincipalsConfig extends TacRequestConfig {
    fields?: EUserPrincipalFields[] | string[] | string,
}

export enum EUserPrincipalFields {
    STREAMER_SUB_KEYS = "streamerSubscriptionKeys",
    STREAMER_CONNECTION_INFO = "streamerConnectionInfo",
    PREFERENCES = "preferences",
    SURROGATE_IDS = "surrogateIds",
}

export interface IUpdateUserPrefConfig extends TacRequestConfig {
    preferences: IPreferencesUpdate,
    accountId: string | number,
}

/**
 * Get user preferences for a given accountId
 */
export async function getUserPreferences(config: IGetUserPreferencesConfig): Promise<IPreferences> {
    config.path = `/v1/accounts/${config.accountId}/preferences`;

    return await apiGet(config);
}

/**
 * Get streamer subscription keys for given accountIds as a comma-separated list: 123,345
 */
export async function getStreamerSubKeys(config: IGetStreamerKeysConfig): Promise<IStreamerSubKeys> {
    config.path = `/v1/userprincipals/streamersubscriptionkeys?accountIds=${(config.accountIds ?? "")}`;

    return await apiGet(config);
}

/**
 * Update user preferences for a given accountId using a preferencesJSON
 */
export async function updateUserPreferences(config: IUpdateUserPrefConfig): Promise<IWriteResponse> {
    config.bodyJSON = config.preferences;
    config.path = `/v1/accounts/${config.accountId}/preferences`;

    return await apiPut(config);
}

/**
 * Get user info. Return additional fields with the config.fields param, a comma-separated string of up to 4 fields:
 * streamerSubscriptionKeys, streamerConnectionInfo, preferences, surrogateIds
 */
export async function getUserPrincipals(config: IGetUserPrincipalsConfig): Promise<IUserPrincipal> {
    const fields = Array.isArray(config.fields) ? config.fields.join(",") : config.fields;
    config.path = `/v1/userprincipals?fields=${(fields ?? "")}`;

    return await apiGet(config);
}
