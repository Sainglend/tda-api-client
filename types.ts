export namespace TDA {
    enum AccountType {
        CASH = 'CASH',
        MARGIN = 'MARGIN'
    }

    export interface IAccountPosition {
        shortQuantity: number,
        averagePrice: number,
        currentDayProfitLoss: number,
        currentDayProfitLossPercentage: number,
        longQuantity: number,
        settledLongQuantity: number,
        settledShortQuantity: number,
        agedQuantity: number,
        instrument: IInstrument,
        marketValue: number,
        maintenanceRequirement: number,
        currentDayCost: number,
        previousSessionLongQuantity: number,
    }

    export interface IInstrument {
        assetType: string,
        cusip: string,
        symbol: string,
        description: string,
        putCall: string,
        exchange: string,
        underlyingSymbol: string,
    }

    export interface IAccountBalance {
        accruedInterest: number,
        availableFundsNonMarginableTrade: number,
        bondValue: number,
        buyingPower: number,
        cashBalance: number,
        cashAvailableForTrading: number,
        cashReceipts: number,
        dayTradingBuyingPower: number,
        dayTradingBuyingPowerCall: number,
        dayTradingEquityCall: number,
        equity: number,
        equityPercentage: number,
        liquidationValue: number,
        longMarginValue: number,
        longOptionMarketValue: number,
        longStockValue: number,
        maintenanceCall: number,
        maintenanceRequirement: number,
        margin: number,
        marginEquity: number,
        moneyMarketFund: number,
        mutualFundValue: number,
        regTCall: number,
        shortMarginValue: number,
        shortOptionMarketValue: number,
        shortStockValue: number,
        totalCash: number,
        isInCall: boolean,
        pendingDeposits: number,
        marginBalance: number,
        shortBalance: number,
        accountValue: number
    }

    export interface ICurrentBalance {
        accruedInterest: number,
        cashBalance: number,
        cashReceipts: number,
        longOptionMarketValue: number,
        liquidationValue: number,
        longMarketValue: number,
        moneyMarketFund: number,
        savings: number,
        shortMarketValue: number,
        pendingDeposits: number,
        availableFunds: number,
        availableFundsNonMarginableTrade: number,
        buyingPower: number,
        buyingPowerNonMarginableTrade: number,
        dayTradingBuyingPower: number,
        equity: number,
        equityPercentage: number,
        longMarginValue: number,
        maintenanceCall: number,
        maintenanceRequirement: number,
        marginBalance: number,
        regTCall: number,
        shortBalance: number,
        shortMarginValue: number,
        shortOptionMarketValue: number,
        sma: number,
        mutualFundValue: number,
        bondValue: number
    }

    export interface IProjectedBalance {
        availableFunds: number,
        availableFundsNonMarginableTrade: number,
        buyingPower: number,
        dayTradingBuyingPower: number,
        dayTradingBuyingPowerCall: number,
        maintenanceCall: number,
        regTCall: number,
        isInCall: boolean,
        stockBuyingPower: number
    }

    export interface IAccount {
        type: string,
        accountId: string,
        roundTrips: number,
        isDayTrader: boolean,
        isClosingOnlyRestricted: boolean,
        positions: IAccountPosition[],
        initialBalances: IAccountBalance,
        currentBalances: ICurrentBalance,
        projectedBalances: IProjectedBalance,
    }

    export interface API_Get_Account_Response {
        securitiesAccount: IAccount
    }


// ORDERS
    export enum Session {
        NORMAL = 'NORMAL',
        AM = 'AM',
        PM = 'PM',
        SEAMLESS = 'SEAMLESS'
    }

    export enum Duration {
        DAY = 'DAY',
        GOOD_TILL_CANCEL = 'GOOD_TILL_CANCEL',
        FILL_OR_KILL = 'FILL_OR_KILL'
    }

    export enum OrderType {
        MARKET = 'MARKET',
        LIMIT = 'LIMIT',
        STOP = 'STOP',
        STOP_LIMIT = 'STOP_LIMIT',
        TRAILING_STOP = 'TRAILING_STOP',
        MARKET_ON_CLOSE = 'MARKET_ON_CLOSE',
        EXERCISE = 'EXERCISE',
        TRAILING_STOP_LIMIT = 'TRAILING_STOP_LIMIT',
        NET_DEBIT = 'NET_DEBIT',
        NET_CREDIT = 'NET_CREDIT',
        NET_ZERO = 'NET_ZERO'
    }

    export interface IOrderTime {
        date: string,
        shortFormat: boolean // should default to false
    }

    export enum ComplexOrderStrategyType {
        NONE = 'NONE',
        COVERED = 'COVERED',
        VERTICAL = 'VERTICAL',
        BACK_RATIO = 'BACK_RATIO',
        CALENDAR = 'CALENDAR',
        DIAGONAL = 'DIAGONAL',
        STRADDLE = 'STRADDLE',
        STRANGLE = 'STRANGLE',
        COLLAR_SYNTHETIC = 'COLLAR_SYNTHETIC',
        BUTTERFLY = 'BUTTERFLY',
        CONDOR = 'CONDOR',
        IRON_CONDOR = 'IRON_CONDOR',
        VERTICAL_ROLL = 'VERTICAL_ROLL',
        COLLAR_WITH_STOCK = 'COLLAR_WITH_STOCK',
        DOUBLE_DIAGONAL = 'DOUBLE_DIAGONAL',
        UNBALANCED_BUTTERFLY = 'UNBALANCED_BUTTERFLY',
        UNBALANCED_CONDOR = 'UNBALANCED_CONDOR',
        UNBALANCED_IRON_CONDOR = 'UNBALANCED_IRON_CONDOR',
        UNBALANCED_VERTICAL_ROLL = 'UNBALANCED_VERTICAL_ROLL',
        CUSTOM = 'CUSTOM'
    }

    export enum Exchange {
        INET = 'INET',
        ECN_ARCA = 'ECN_ARCA',
        CBOE = 'CBOE',
        AMEX = 'AMEX',
        PHLX = 'PHLX',
        ISE = 'ISE',
        BOX = 'BOX',
        NYSE = 'NYSE',
        NASDAQ = 'NASDAQ',
        BATS = 'BATS',
        C2 = 'C2',
        AUTO = 'AUTO'
    }

    export enum PriceLinkBasis {
        MANUAL = 'MANUAL',
        BASE = 'BASE',
        TRIGGER = 'TRIGGER',
        LAST = 'LAST',
        BID = 'BID',
        ASK = 'ASK',
        ASK_BID = 'ASK_BID',
        MARK = 'MARK',
        AVERAGE = 'AVERAGE'
    }

    export enum PriceLinkType {
        VALUE = 'VALUE',
        PERCENT = 'PERCENT',
        TICK = 'TICK'
    }

    export enum StopType {
        STANDARD = 'STANDARD',
        BID = 'BID',
        ASK = 'ASK',
        LAST = 'LAST',
        MARK = 'MARK'
    }

    export enum TaxLotMethod {
        FIFO = 'FIFO',
        LIFO = 'LIFO',
        HIGH_COST = 'HIGH_COST',
        LOW_COST = 'LOW_COST',
        AVERAGE_COST = 'AVERAGE_COST',
        SPECIFIC_LOT = 'SPECIFIC_LOT'
    }

    export enum OrderInstruction {
        BUY = 'BUY',
        SELL = 'SELL',
        BUY_TO_COVER = 'BUY_TO_COVER',
        SELL_SHORT = 'SELL_SHORT',
        BUY_TO_OPEN = 'BUY_TO_OPEN',
        BUY_TO_CLOSE = 'BUY_TO_CLOSE',
        SELL_TO_OPEN = 'SELL_TO_OPEN',
        SELL_TO_CLOSE = 'SELL_TO_CLOSE',
        EXCHANGE = 'EXCHANGE'
    }

    export enum PositionEffect {
        OPENING = 'OPENING',
        CLOSING = 'CLOSING',
        AUTOMATIC = 'AUTOMATIC'
    }

    export enum QuantityType {
        ALL_SHARES = 'ALL_SHARES',
        DOLLARS = 'DOLLARS',
        SHARES = 'SHARES'
    }

    export interface IOrderLeg {
        orderLegType: AssetType,
        legId: string, // int64
        instrument: IInstrument,
        instruction: OrderInstruction,
        positionEffect: PositionEffect,
        quantity: number, // double
        quantityType: QuantityType
    }

    export enum SpecialInstruction {
        ALL_OR_NONE = 'ALL_OR_NONE',
        DO_NOT_REDUCE = 'DO_NOT_REDUCE',
        ALL_OR_NONE_DO_NOT_REDUCE = 'ALL_OR_NONE_DO_NOT_REDUCE'
    }

    export enum OrderStrategyType {
        SINGLE = 'SINGLE',
        OCO = 'OCO',
        TRIGGER = 'TRIGGER'
    }

    export enum OrderStatus {
        AWAITING_PARENT_ORDER = 'AWAITING_PARENT_ORDER',
        AWAITING_CONDITION = 'AWAITING_CONDITION',
        AWAITING_MANUAL_REVIEW = 'AWAITING_MANUAL_REVIEW',
        ACCEPTED = 'ACCEPTED',
        AWAITING_UR_OUT = 'AWAITING_UR_OUT',
        PENDING_ACTIVATION = 'PENDING_ACTIVATION',
        QUEUED = 'QUEUED',
        WORKING = 'WORKING',
        REJECTED = 'REJECTED',
        PENDING_CANCEL = 'PENDING_CANCEL',
        CANCELED = 'CANCELED',
        PENDING_REPLACE = 'PENDING_REPLACE',
        REPLACED = 'REPLACED',
        FILLED = 'FILLED',
        EXPIRED = 'EXPIRED'
    }

    export enum ActivityType {
        EXECUTION = 'EXECUTION',
        ORDER_ACTION = 'ORDER_ACTION'
    }

    export enum ExecutionType {
        FILL = 'FILL'
    }

    export interface IExecutionLeg {
        legId: string, // int32
        quantity: number, // double
        mismarkedQuantity: number, // double
        price: number, // double
        time: string // date-time
    }

    export interface IOrderActivity {
        activityType: ActivityType,
        executionType: ExecutionType,
        quantity: number,
        orderRemainingQuantity: number,
        executionLegs: IExecutionLeg[]
    }

    export interface IExecution extends IOrderActivity {

    }

    export interface IOrderGet {
        session: Session,
        duration: Duration,
        orderType: OrderType,
        cancelTime: IOrderTime,
        complexOrderStrategyType: ComplexOrderStrategyType,
        quantity: number, // double,
        filledQuantity: number, // double
        remainingQuantity: number, // double
        requestedDestination: Exchange,
        destinationLinkName: string,
        releaseTime: string // date-time
        stopPrice: number // double
        stopPriceLinkBasis: PriceLinkBasis,
        stopPriceLinkType: PriceLinkType,
        stopPriceOffset: number, // double
        stopType: StopType,
        priceLinkBasis: PriceLinkBasis,
        priceLinkType: PriceLinkType,
        price: number, // double
        taxLotMethod: TaxLotMethod,
        orderLegCollection: IOrderLeg[],
        activationPrice: number, // double
        specialInstruction: SpecialInstruction,
        orderStrategyType: OrderStrategyType,
        orderId: string, // int64
        cancelable: boolean, // default false
        editable: boolean, // default false
        status: OrderStatus,
        enteredTime: string, // date-time
        closeTime: string, // date-time
        tag: string,
        accountId: number, // int64
        orderActivityCollection: IOrderActivity[],
        replacingOrderCollection: IOrderStrategy[],
        childOrderStrategies: IOrderStrategy[],
        statusDescription: string,

        accountNickname: string,
    }


    export interface IOrderStrategy {
        session: Session,
        duration: Duration,
        orderType: OrderType,
        cancelTime: IOrderTime,
        complexOrderStrategyType: ComplexOrderStrategyType,
        quantity: number, // double,
        filledQuantity: number, // double
        remainingQuantity: number, // double
        requestedDestination: Exchange,
        destinationLinkName: string,
        releaseTime: string // date-time
        stopPrice: number // double
        stopPriceLinkBasis: PriceLinkBasis,
        stopPriceLinkType: PriceLinkType,
        stopPriceOffset: number, // double
        stopType: StopType,
        priceLinkBasis: PriceLinkBasis,
        priceLinkType: PriceLinkType,
        price: number, // double
        taxLotMethod: TaxLotMethod,
        orderLegCollection: IOrderLeg[],
        activationPrice: number, // double
        specialInstruction: SpecialInstruction,
        orderStrategyType: OrderStrategyType,
        orderId: number, // int64
        cancelable: boolean, // default false
        editable: boolean, // default false
        status: OrderStatus,
        enteredTime: string, // date-time
        closeTime: string, // date-time
        tag: string,
        accountId: number, // int64
        orderActivityCollection: IOrderActivity[],
        replacingOrderCollection: IOrderStrategy[],
        childOrderStrategies: IOrderStrategy[],
        statusDescription: string
    }

    export interface ISecuritiesAccount {
        type: AccountType,
        accountId: string,
        roundTrips: number,
        isDayTrader: boolean,
        isClosingOnlyRestricted: boolean,
        positions: IAccountPosition[],
        orderStrategies: IOrderStrategy[]
    }

    export interface IBalances {
        accruedInterest: number, // double
        bondValue: number, // double
        cashBalance: number, // double
        cashReceipts: number, // double
        liquidationValue: number, // double
        longOptionMarketValue: number, // double
        moneyMarketFund: number,
        mutualFundValue: number,
        pendingDeposits: number,
        shortOptionMarketValue: number,
    }

    export interface IMarginBalances extends IBalances {
        availableFundsNonMarginableTrade: number, // double
        buyingPower: number, // double
        dayTradingBuyingPower: number, // double
        dayTradingBuyingPowerCall: number, // double
        equity: number, // double
        equityPercentage: number, // double
        isInCall: boolean // default false
        longMarginValue: number, // double
        maintenanceCall: number, // double
        maintenanceRequirement: number, // double
        marginBalance: number, // double
        regTCall: number, // double
        shortBalance: number, // double
        shortMarginValue: number, // double
    }

    export interface IMarginBalancesInit extends IMarginBalances {
        accountValue: number, // double ***
        cashAvailableForTrading: number, // double ***
        dayTradingEquityCall: number, // double ***
        longStockValue: number, // double ***
        margin: number, // double ***
        marginEquity: number, // double ***
        shortStockValue: number, // double ***
        totalCash: number, // double ***
        unsettledCash: number, // double ***
    }

    export interface IMarginBalancesEnd extends IMarginBalances {
        availableFunds: number, // double ***
        buyingPowerNonMarginableTrade: number, // double ***
        longMarketValue: number, // double ***
        optionBuyingPower: number // double ***
        savings: number, // double ***
        shortMarketValue: number, // double ***
        sma: number, // double ***
        stockBuyingPower: number, // double ***
    }

    export interface IMarginAccount extends ISecuritiesAccount {
        initialBalances: IMarginBalancesInit,
        currentBalances: IMarginBalancesEnd,
        projectedBalances: IMarginBalancesEnd
    }

    export interface ICashBalance extends IBalances {
        cashAvailableForTrading: number,
        cashAvailableForWithdrawal: number,
        cashCall: number,
        cashDebitCallValue: number,
        savings: number,
        shortMarketValue: number,
        totalCash: number,
        unsettledCash: number,
    }

    export interface ICashBalanceInit extends ICashBalance {
        accountValue: number, // ***
        isInCall: boolean, // default false ***
        longStockValue: number, // ***
        shortStockValue: number,
    }

    export interface ICashBalanceCurrent extends ICashBalance {
        longNonMarginableMarketValue: number, // ***
        longMarketValue: number, // ***
    }

    export interface ICashAccount extends ISecuritiesAccount {
        initialBalances: ICashBalanceInit,
        currentBalances: ICashBalanceCurrent,
        projectedBalances: ICashBalanceCurrent
    }

    export interface IEquity extends IInstrument {
    }


    export interface IFixedIncome extends IInstrument {
        maturityDate: string, // date-time
        variableRate: number, // double
        factor: number, // double
    }

    export enum MutualFundType {
        NOT_APPLICATBLE = 'NOT_APPLICABLE',
        OPEN_END_NON_TAXABLE = 'OPEN_END_NON_TAXABLE',
        OPEN_END_TAXABLE = 'OPEN_END_TAXABLE',
        NO_LOAD_NON_TAXABLE = 'NO_LOAD_NON_TAXABLE',
        NO_LOAD_TAXABLE = 'NO_LOAD_TAXABLE'
    }

    export interface IMutualFund extends IInstrument {
        type: MutualFundType
    }

    export enum CashEquivalentType {
        SAVINGS = 'SAVINGS',
        MONEY_MARKET_FUND = 'MONEY_MARKET_FUND'
    }

    export interface ICashEquivalent extends IInstrument {
        type: CashEquivalentType
    }

    export enum OptionType {
        VANILLA = 'VANILLA',
        BINARY = 'BINARY',
        BARRIER = 'BARRIER'
    }

    export enum PutCall {
        PUT = 'PUT',
        CALL = 'CALL'
    }

    export enum CurrencyType {
        USD = 'USD',
        CAD = 'CAD',
        EUR = 'EUR',
        JPY = 'JPY'
    }

    export interface IOptionDeliverable {
        symbol: string,
        deliverableUnits: number, // double
        currencyType: CurrencyType,
        assetType: AssetType
    }

    export interface IOption extends IInstrument {
        type: OptionType,
        putCall: PutCall,
        underlyingSymbol: string,
        optionMultiplier: number, // int32
        optionDeliverables: IOptionDeliverable[]
    }

    // INSTRUMENTS
    export enum BondAssetType {
        BOND = 'BOND'
    }

    export interface IBond {
        bondPrice: number, // double
        cusip: string,
        symbol: string,
        description: string,
        exchange: string,
        assetType: BondAssetType
    }

    export interface IFundamentalData {
        symbol: string,
        high52: number, // double
        low52: number, // double
        dividendAmount: number, // double
        dividendYield: number, // double
        dividendDate: string,
        peRatio: number, // double
        pegRatio: number, // double
        pbRatio: number, // double
        prRatio: number, // double
        pcfRatio: number, // double
        grossMarginTTM: number, // double
        grossMarginMRQ: number, // double
        netProfitMarginTTM: number, // double
        netProfitMarginMRQ: number, // double
        operatingMarginTTM: number, // double
        operatingMarginMRQ: number, // double
        returnOnEquity: number, // double
        returnOnAssets: number, // double
        returnOnInvestment: number, // double
        quickRatio: number, // double
        currentRatio: number, // double
        interestCoverage: number, // double
        totalDebtToCapital: number, // double
        ltDebtToEquity: number, // double
        totalDebtToEquity: number, // double
        epsTTM: number, // double
        epsChangePercentTTM: number, // double
        epsChangeYear: number, // double
        epsChange: number, // double
        revChangeYear: number, // double
        revChangeTTM: number, // double
        revChangeIn: number, // double
        sharesOutstanding: number, // double
        marketCapFloat: number, // double
        marketCap: number, // double
        bookValuePerShare: number, // double
        shortIntToFloat: number, // double
        shortIntDayToCover: number, // double
        divGrowthRate3Year: number, // double
        dividendPayAmount: number, // double
        dividendPayDate: string,
        beta: number, // double
        vol1DayAvg: number, // double
        vol10DayAvg: number, // double
        vol3MonthAvg: number, // double
    }

    export enum FundamentalAssetType {
        EQUITY = 'EQUITY',
        ETF = 'ETF',
        MUTUAL_FUND = 'MUTUAL_FUND',
        UNKNOWN = 'UNKNOWN'
    }

    export interface IFundamental {
        cusip: string,
        symbol: string,
        description: string,
        exchange: string,
        assetType: FundamentalAssetType,
        fundamental: IFundamentalData
    }

    export enum AssetType {
        EQUITY = 'EQUITY',
        ETF = 'ETF',
        FOREX = 'FOREX',
        FUTURE = 'FUTURE',
        FUTURE_OPTION = 'FUTURE_OPTION',
        INDEX = 'INDEX',
        INDICATOR = 'INDICATOR',
        MUTUAL_FUND = 'MUTUAL_FUND',
        OPTION = 'OPTION',
        UNKNOWN = 'UNKNOWN'
    }
}