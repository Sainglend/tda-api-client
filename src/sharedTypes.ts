
export enum EAssetType {
    EQUITY = "EQUITY",
    ETF = "ETF",
    FOREX = "FOREX",
    FUTURE = "FUTURE",
    FUTURE_OPTION = "FUTURE_OPTION",
    INDEX = "INDEX",
    INDICATOR = "INDICATOR",
    MUTUAL_FUND = "MUTUAL_FUND",
    OPTION = "OPTION",
    UNKNOWN = "UNKNOWN",
    CASH_EQUIVALENT = "CASH_EQUIVALENT",
    FIXED_INCOME = "FIXED_INCOME",
    CURRENCY = "CURRENCY",
}

export interface IInstrument {
    assetType: EAssetType,
    cusip?: string,
    symbol: string,
    description?: string,
    exchange?: string,
}

export type IEquity = IInstrument

export interface IFixedIncome extends IInstrument {
    // "assetType": "'EQUITY' or 'OPTION' or 'INDEX' or 'MUTUAL_FUND' or 'CASH_EQUIVALENT' or 'FIXED_INCOME' or 'CURRENCY'",
    // "cusip": "string",
    // "symbol": "string",
    // "description": "string",
    maturityDate: string, // date-time
    variableRate: number, // double
    factor: number, // double
}

export interface IMutualFund extends IInstrument {
    type: EMutualFundType
}

export enum EMutualFundType {
    NOT_APPLICABLE,
    OPEN_END_NON_TAXABLE,
    OPEN_END_TAXABLE,
    NO_LOAD_NON_TAXABLE,
    NO_LOAD_TAXABLE,
}

export interface ICashEquivalent extends IInstrument {
    type: ECashEquivalentType
}

export interface IBond extends Omit<IInstrument, "assetType"> {
    bondPrice: number,
    assetType: "BOND",
    bondMaturityDate: string,
    bondInterestRate: number,
}

export enum ECashEquivalentType {
    SAVINGS,
    MONEY_MARKET_FUND,
}

export enum EOptionInstrumentType {
    VANILLA,
    BINARY,
    BARRIER,
}

export interface IOptionInstrument extends IInstrument {
    type: EOptionInstrumentType,
    putCall: "PUT" | "CALL",
    underlyingSymbol: string,
    optionMultiplier: number, // int32
    optionDeliverables: IOptionDeliverable[],
    optionExpirationDate: string,
    optionStrikePrice: number,
}

export interface IOptionDeliverable {
    symbol: string,
    deliverableUnits: number,
    currencyType: ECurrencyType,
    assetType: EAssetType,
}

export enum ECurrencyType {
    USD,
    CAD,
    EUR,
    JPY,
}

export interface ICandle {
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number,
    datetime: number,
}
