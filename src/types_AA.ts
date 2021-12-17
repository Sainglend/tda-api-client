
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
}

export interface IInstrument {
    assetType: EAssetType,
    cusip: string,
    symbol: string,
    description: string,
    exchange: string,
    putCall?: string,
    underlyingSymbol?: string,
}

export interface IEquity extends IInstrument {
    // assetType: string,
    // cusip: string,
    // symbol: string,
    // description: string,
}

export interface IFixedIncome extends IInstrument {
    // "assetType": "'EQUITY' or 'OPTION' or 'INDEX' or 'MUTUAL_FUND' or 'CASH_EQUIVALENT' or 'FIXED_INCOME' or 'CURRENCY'",
    // "cusip": "string",
    // "symbol": "string",
    // "description": "string",
    // "maturityDate": "string",
    // "variableRate": 0,
    // "factor": 0
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

// instruments
export interface IBond extends IInstrument {
    bondPrice: number,
    assetType: "BOND",
}

export enum ECashEquivalentType {
    SAVINGS,
    MONEY_MARKET_FUND,
}

export enum EOptionType {
    VANILLA,
    BINARY,
    BARRIER,
}

export interface IOption extends IInstrument {
    type: EOptionType,
    putCall: 'PUT' | 'CALL',
    underlyingSymbol: string,
    optionMultiplier: number, // int32
    optionDeliverables: IOptionDeliverable[]
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

export interface IInstrument_Transaction {
    symbol: string,
    underlyingSymbol: string,
    optionExpirationDate: string,
    optionStrikePrice: number,
    putCall: string,
    cusip: string,
    description: string,
    assetType: string,
    bondMaturityDate: string,
    bondInterestRate: number,
}